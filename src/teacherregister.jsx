import RoleRegisterForm from "./RoleRegisterForm.jsx";

export default function TeacherRegister({ registrationTarget, onSubmit, statusMessage, onLogin, apiBase }) {
  return <RoleRegisterForm registrationTarget={registrationTarget} onSubmit={onSubmit} statusMessage={statusMessage} onLogin={onLogin} apiBase={apiBase} />;
}
