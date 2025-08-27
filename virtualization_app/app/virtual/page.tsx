import BlackBox from "@/components/ui/black_box"
export default function Page() {
    return (
        <h3>
            virtual page
            <BlackBox width={100} height={100} border="1px solid black" backgroundColor="red" />
        </h3>
    )
}
