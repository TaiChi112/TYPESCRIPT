interface Image {
  url: string;
  width?: string;
}
export default function Logo({ url, width = "10em" }: Image) {
  const imgStyle = {
    width: width,
    height: "auto",
  };
  return (
    <>
      <img style={imgStyle} src={url} alt="Not image" />
    </>
  );
}
