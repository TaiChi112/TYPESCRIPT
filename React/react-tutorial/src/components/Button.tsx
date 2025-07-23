import { IButton } from '../interface/Button'
import classes from "../style/button.module.css"
export default function Button({ label, description }: IButton) {
    const { Button, Card } = classes
    return (
        <>
            <button className={`${Button}${Card}`}>{label}<p>{description}</p></button>
        </>
    )
}

