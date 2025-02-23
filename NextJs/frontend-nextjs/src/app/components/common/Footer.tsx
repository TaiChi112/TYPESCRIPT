import React from 'react'
const youtube_url: string = "https://youtube.com/"
const github_url: string = "https://github.com/TaiChi112"
const linkedin_url: string = "https://www.linkedin.com/in/anothai-vichapaiboon-a88790260/"
export const Footer = () => {
    return (
        <>
            <main style={{ display: 'flex', justifyContent: "center" }}>
                <footer style={{ display: "flex", justifyContent: "space-around", width: "1500px", height: "300px", background: "black" }}>
                    <section style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>
                        <ul>ABOUT US
                            <li style={{ margin: "10px" }}>Our Blog</li>
                            <li style={{ margin: "10px" }}>Work with us</li>
                            <li style={{ margin: "10px" }}>Newss and activities</li>
                            <li style={{ margin: "10px" }}>Join our business</li>
                        </ul>
                    </section>
                    <section style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>
                        <ul>HELP
                            <li style={{ margin: "10px" }}>FAQ</li>
                            <li style={{ margin: "10px" }}>Shipping</li>
                            <li style={{ margin: "10px" }}>Call Center 112-112-1120</li>
                            <li style={{ margin: "10px" }}>Member service 112-112-1120</li>
                        </ul>
                    </section>
                    <section style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>
                        <ul>FOLLOW US
                            <li style={{ margin: "10px" }}><a href={youtube_url} target='blank_youtube'>Youtube</a></li>
                            <li style={{ margin: "10px" }}><a href={github_url} target='blank_github'>Github</a></li>
                            <li style={{ margin: "10px" }}><a href={linkedin_url} target='blank_linkedin'>Linkedin</a></li>
                            <form style={{ background: "white", borderRadius: "5px" }} >
                                <input style={{ border: "2px solid black", padding: "5px", borderRadius: "5px 0 0 5px", margin: "2px", background: "black" }} type="email" placeholder='Enter your email' />
                                <button style={{ background: "white", color: "black", padding: "5px", borderRadius: "0 5px 5px 0", margin: "5px", fontFamily: "Sans-serif", fontWeight: 700 }}>send</button>
                            </form>
                        </ul>
                    </section>
                </footer>
            </main>
        </>
    )
}
