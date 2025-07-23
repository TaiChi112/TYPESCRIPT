type BlackBoxProps = {
    width: number;
    height: number;
    border?: string;
    backgroundColor?: string;
};

export default function BlackBox({ width, height, border, backgroundColor }: BlackBoxProps) {
    return (
        <div
            style={{
                width,
                height,
                border,
                backgroundColor: backgroundColor || 'black',
            }}
        >
            BlackBox
        </div>
    )
}
