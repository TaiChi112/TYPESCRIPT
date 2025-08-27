import React from 'react'

function Content_slug({ params }: { params: { slug: string } }) {
  return (
    <div>Content_slug : {params.slug}</div>
  )
}

export default Content_slug