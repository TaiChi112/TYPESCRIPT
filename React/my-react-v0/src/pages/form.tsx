import { useState } from "react"

export default function Form() {
  const [inputValue, setInputValue] = useState<string>('');
  const [submittedItems, setSubmittedItems] = useState<string[]>([]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitted data:", inputValue);
    setSubmittedItems([...submittedItems, inputValue]);
    setInputValue(''); 
    if (inputValue.trim() !== '') {
      setSubmittedItems([...submittedItems, inputValue.trim()]);
      setInputValue('');
    } else {
      alert('Please enter some data before submitting!');
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="displayOnSubmitInput">
          Enter something:
        </label>
        <input
          type="text"
          id="displayOnSubmitInput"
          name="displayOnSubmitInput"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Type here..."
          style={{ marginLeft: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{
            marginLeft: '10px',
            padding: '8px 15px',
            backgroundColor: '#28a745', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </form>
       <h2>Submitted Data List:</h2>
      {submittedItems.length === 0 ? (
        <p style={{ color: '#666' }}>No data submitted yet.</p>
      ) : (
        <ul style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
          {submittedItems.map((item) => (
            <li key={item} style={{ marginBottom: '5px', fontSize: '1.1em' }}>
              {item}
            </li>
          ))}
        </ul>
      )}

    </>
  )
}
