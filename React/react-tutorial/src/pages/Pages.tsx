import Button from "../components/Button"
import Card from "../components/Card"

export default function app() {
  return (
    <>
      <Card />
      <Button description='Hello world' label='Button' />
      <Button description='Hello world' label='Arrow' />
      {/* <Card title='Title' content='Content' weight='Weight' /> */}
    </>
  )
}
