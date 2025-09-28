interface Button {
  label: string;
  color?: string;
}
export default function Button({ label, color = "#0f0" }: Button) {
  const buttonStyle = {
    backgroundColor: color,
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    color: "white",
    border: "none",
  };
  const Alert = () => {
    alert("Hello world!");
  };
  return (
    <>
      <button onClick={Alert} style={buttonStyle}>
        {label}
      </button>
    </>
  );
}
