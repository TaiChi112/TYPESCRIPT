import classes from "../style/card.module.css"
const URL = {
    profile: "https://wallpapers.com/images/featured/picture-en3dnh2zi84sgt3t.jpg"
}
const log = "TaiChi 112"
export default function Card() {
    const { Card, Bg, Profile,Score } = classes
    return (
        <>
            <div className={Card}>
                <div className={Bg}></div>
                <div className={Profile}>
                    <img src={URL.profile} alt="Profile" />
                </div>
                <div className="log">{log}</div>
                <div className={Score}>
                    <div className="item">17</div>
                    <div className="item">9.7K</div>
                    <div className="item">274</div>
                </div>
            </div>
        </>
    )
}
