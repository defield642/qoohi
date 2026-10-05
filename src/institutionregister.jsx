export default function InstitutionRegister({
  mode,
  setMode,
  form,
  update,
  suggestions,
  choosePlace,
  setPlaceQuery,
  setForm,
  busy,
  submitAuth,
  code,
  setCode,
  verify,
  status,
  error,
  apiBase,
}) {
  return <main className={`institution-auth ${mode === "register" ? "active" : ""}`}>
    <section className="institution-form-panel">
      {mode === "register" && <>
        <h1>Create Account</h1><p className="institution-kicker">Register your institution</p>
        <form onSubmit={submitAuth}>
          <div className="institution-place-field"><input required placeholder="Type your institution name" value={form.name} onChange={(event) => { setPlaceQuery(event.target.value); setForm((current) => ({ ...current, name: event.target.value, location: current.location, latitude: null, longitude: null })); }} />
            {suggestions.length > 0 && <div className="institution-place-suggestions">{suggestions.map((place) => <button type="button" key={place.placeId} onClick={() => choosePlace(place.placeId)}><strong>{place.text.split(",")[0]}</strong><small>{place.text}</small></button>)}</div>}
          </div>
          <input required placeholder="Institution location in Kenya" value={form.location} onChange={update("location")} />
          <input required type="email" placeholder="Institution email" value={form.email} onChange={update("email")} />
          <input placeholder="Phone number" value={form.phone} onChange={update("phone")} />
          <select value={form.school_type} onChange={update("school_type")}><option value="junior">CBC Primary / Junior (Grades 1–9)</option><option value="senior">CBC Senior School (Grades 10–12)</option></select>
          <input placeholder="Institution motto (optional)" value={form.motto} onChange={update("motto")} />
          {form.logo_url && <div className="institution-logo-preview"><img src={form.logo_url.startsWith("/") ? `${apiBase}${form.logo_url}` : form.logo_url} alt="Institution from Google Maps" /><span>Maps photo selected. Add a logo URL in Settings if preferred.</span></div>}
          <button className="institution-btn" disabled={busy}>{busy ? "Sending..." : "Register institution"}</button>
        </form>
      </>}
      {mode === "login" && <><h1>Institution Login</h1><p className="institution-kicker">Access your institution workspace</p><form onSubmit={submitAuth}><input required type="email" placeholder="Institution email" value={form.email} onChange={update("email")} /><button className="institution-btn" disabled={busy}>{busy ? "Sending..." : "Send login code"}</button></form></>}
      {mode === "verify" && <><h1>Verify Email</h1><p className="institution-kicker">Enter the code sent to {form.email}</p><form onSubmit={verify}><input required inputMode="numeric" maxLength="6" placeholder="Six-digit verification code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} /><button className="institution-btn institution-outline" disabled={busy}>{busy ? "Verifying..." : "Verify email"}</button></form></>}
      {(status || error) && <p className={error ? "institution-error" : "institution-status"}>{error || status}</p>}
    </section>
    <section className="institution-toggle"><div className="institution-toggle-inner"><div className="institution-toggle-panel institution-left"><h2>Welcome Back!</h2><p>Already have an account?</p><button className="institution-ghost" type="button" onClick={() => setMode("login")}>Login</button></div><div className="institution-toggle-panel institution-right"><h2>Hello, Welcome</h2><p>Register your institution</p><button className="institution-ghost" type="button" onClick={() => setMode("register")}>Register</button></div></div></section>
  </main>;
}
