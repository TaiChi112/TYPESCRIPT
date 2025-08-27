import React from 'react'

function Content_id({ params }: { params: { slug: string, id: string } }) {
  return (
    <div>Content_id : {params.slug} : {params.id}</div>
  )
}

export default Content_id