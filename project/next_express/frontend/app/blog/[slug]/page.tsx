import React from 'react'

function Blog({ params }: { params: { slug: string } }) {
  return (
    <div>Blog : {params.slug}</div>
  )
}

export default Blog