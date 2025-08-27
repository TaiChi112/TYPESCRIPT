import React from 'react'

function Sub_blog_id({ params }: { params: { slug: string } }) {
  return (
    <div>Sub_blog_id : {params.slug}</div>
  )
}

export default Sub_blog_id