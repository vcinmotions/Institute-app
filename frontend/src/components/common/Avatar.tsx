
type AvatarProps = {
  name: string;
  size?: number;
};

export default function Avatar({ name, size = 40 }: AvatarProps) {
  const letter = name?.charAt(0).toUpperCase() || "?";

  const colors = ["#1976d2", "#388e3c", "#f57c00", "#7b1fa2"];
  const bgColor = colors[name?.length % colors.length];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bgColor,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size / 2,
        fontWeight: "bold",
        userSelect: "none",
      }}
    >
      {letter}
    </div>
  );
}
