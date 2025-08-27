import Logo from "./Logo";

export default function Nav() {
  const url =
    "https://scontent.fbkk2-7.fna.fbcdn.net/v/t39.30808-6/426345599_707262931521210_4253013644334428177_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=efb6e6&_nc_eui2=AeF-d3_jPUnLK3iX0I_UDSPoL67gfCkfPm0vruB8KR8-bYW7PwFv-VQxdmDp_NzWw6DYI627BDHm_Mi27OmOZiBw&_nc_ohc=JOCYP_g0zEoAX_uAmUw&_nc_ht=scontent.fbkk2-7.fna&oh=00_AfBpa6MVGPAQw1-QOSny8b0EMv24M5xc39fVCggFephZqQ&oe=65D7127B";
  return (
    <>
      <nav>
        <h1>Hello world!</h1>
        <Logo url={url} />
      </nav>
    </>
  );
}
