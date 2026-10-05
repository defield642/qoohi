package com.qoohi.backend.api;

import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@RestController
@RequestMapping("/api/iep-books")
public class IepBookController {
  private static final int MAX_ARCHIVE_ENTRIES = 250;
  private static final int MAX_ENTRY_BYTES = 8 * 1024 * 1024;
  private static final int MAX_ARCHIVE_BYTES = 40 * 1024 * 1024;
  private static final String ZIP_CONTENT_TYPE = "application/zip";

  private final JdbcTemplate db;

  public IepBookController(JdbcTemplate db) {
    this.db = db;
  }

  @GetMapping
  public Map<String,Object> list(@RequestParam int grade) {
    return Map.of("books", db.queryForList(
      "SELECT id,grade,subject,title,filename,content_type,created_at FROM iep_books WHERE grade=? ORDER BY subject",
      grade
    ));
  }

  @GetMapping("/{id}/preview")
  public Map<String,Object> preview(@PathVariable long id) {
    Map<String,Object> book = getBook(id);
    byte[] content = (byte[]) book.get("content");
    String contentType = String.valueOf(book.get("content_type"));
    if (MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(contentType)) {
      requirePdf(content);
      return Map.of("files", List.of(Map.of(
        "entry", "@document",
        "name", safeFilename(String.valueOf(book.get("filename"))),
        "kind", "pdf",
        "size", content.length
      )));
    }
    if (!ZIP_CONTENT_TYPE.equalsIgnoreCase(contentType)) {
      throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"This book format cannot be previewed.");
    }
    return Map.of("files", archiveFiles(content));
  }

  @GetMapping("/{id}/preview/file")
  public ResponseEntity<byte[]> previewFile(@PathVariable long id, @RequestParam String entry) {
    Map<String,Object> book = getBook(id);
    byte[] content;
    String filename;
    if ("@document".equals(entry) && MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(String.valueOf(book.get("content_type")))) {
      content = (byte[]) book.get("content");
      filename = safeFilename(String.valueOf(book.get("filename")));
    } else if (ZIP_CONTENT_TYPE.equalsIgnoreCase(String.valueOf(book.get("content_type")))) {
      Map.Entry<String,byte[]> extracted = extractFile((byte[]) book.get("content"), entry);
      content = extracted.getValue();
      filename = safeFilename(extracted.getKey());
    } else {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Book preview file was not found.");
    }

    String kind = kindFor(filename);
    MediaType mediaType = switch (kind) {
      case "pdf" -> {
        requirePdf(content);
        yield MediaType.APPLICATION_PDF;
      }
      case "image" -> imageType(filename);
      case "text" -> MediaType.parseMediaType("text/plain;charset=UTF-8");
      default -> throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"This book file format cannot be previewed.");
    };
    return ResponseEntity.ok()
      .contentType(mediaType)
      .header(HttpHeaders.CONTENT_DISPOSITION,"inline; filename=\""+filename+"\"")
      .header("X-Content-Type-Options","nosniff")
      .body(content);
  }

  @GetMapping("/{id}/download")
  public ResponseEntity<byte[]> download(@PathVariable long id) {
    Map<String,Object> book = getBook(id);
    String filename = safeFilename(String.valueOf(book.get("filename")));
    MediaType type;
    try { type = MediaType.parseMediaType(String.valueOf(book.get("content_type"))); }
    catch(Exception e) { type = MediaType.APPLICATION_OCTET_STREAM; }
    return ResponseEntity.ok()
      .contentType(type)
      .header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\""+filename+"\"")
      .body((byte[]) book.get("content"));
  }

  private Map<String,Object> getBook(long id) {
    return db.queryForMap("SELECT filename,content_type,content FROM iep_books WHERE id=?",id);
  }

  private List<Map<String,Object>> archiveFiles(byte[] archive) {
    List<Map<String,Object>> files = new ArrayList<>();
    int totalBytes = 0;
    int entryCount = 0;
    try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(archive))) {
      ZipEntry file;
      while ((file = zip.getNextEntry()) != null) {
        if (++entryCount > MAX_ARCHIVE_ENTRIES) {
          throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"This book archive contains too many files to preview.");
        }
        String name = normalizedEntry(file.getName());
        if (!file.isDirectory() && safeEntry(name)) {
          byte[] contents = readBounded(zip, MAX_ENTRY_BYTES);
          totalBytes += contents.length;
          if (totalBytes > MAX_ARCHIVE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"This book archive is too large to preview.");
          }
          files.add(Map.of("entry",name,"name",fileName(name),"kind",kindFor(name),"size",contents.length));
        }
        zip.closeEntry();
      }
    } catch (ResponseStatusException e) {
      throw e;
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,"The book archive could not be read.",e);
    }
    return files;
  }

  private Map.Entry<String,byte[]> extractFile(byte[] archive, String requestedEntry) {
    String safeRequested = normalizedEntry(requestedEntry);
    if (!safeEntry(safeRequested)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid book preview file.");
    }
    try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(archive))) {
      ZipEntry file;
      while ((file = zip.getNextEntry()) != null) {
        String name = normalizedEntry(file.getName());
        if (!file.isDirectory() && name.equals(safeRequested) && safeEntry(name)) {
          String kind = kindFor(name);
          if (!Set.of("pdf","image","text").contains(kind)) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"This book file format cannot be previewed.");
          }
          return Map.entry(name,readBounded(zip,MAX_ENTRY_BYTES));
        }
        zip.closeEntry();
      }
    } catch (ResponseStatusException e) {
      throw e;
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,"The book archive could not be read.",e);
    }
    throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Book preview file was not found.");
  }

  private byte[] readBounded(ZipInputStream zip, int limit) throws IOException {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    byte[] buffer = new byte[8192];
    int count;
    while ((count = zip.read(buffer)) != -1) {
      if (out.size() + count > limit) {
        throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"A book file is too large to preview.");
      }
      out.write(buffer,0,count);
    }
    return out.toByteArray();
  }

  private MediaType imageType(String filename) {
    return switch (filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT)) {
      case "png" -> MediaType.IMAGE_PNG;
      case "gif" -> MediaType.IMAGE_GIF;
      case "webp" -> MediaType.parseMediaType("image/webp");
      default -> MediaType.IMAGE_JPEG;
    };
  }

  private String kindFor(String filename) {
    String name = filename.toLowerCase(Locale.ROOT);
    if (name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".gif") || name.endsWith(".webp")) return "image";
    if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv")) return "text";
    return "unsupported";
  }

  private void requirePdf(byte[] content) {
    if (content.length < 5 || content[0] != '%' || content[1] != 'P' || content[2] != 'D' || content[3] != 'F' || content[4] != '-') {
      throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"The stored book is not a valid PDF.");
    }
  }

  private String normalizedEntry(String name) {
    return name == null ? "" : name.replace('\\','/');
  }

  private boolean safeEntry(String name) {
    if (name.isBlank() || name.startsWith("/") || name.matches("^[A-Za-z]:.*")) return false;
    return Arrays.stream(name.split("/")).noneMatch(part -> part.isBlank() || part.equals(".") || part.equals(".."));
  }

  private String fileName(String name) {
    int slash = name.lastIndexOf('/');
    return slash < 0 ? name : name.substring(slash + 1);
  }

  private String safeFilename(String filename) {
    return fileName(normalizedEntry(filename)).replaceAll("[\\\"\\r\\n]","_");
  }
}
