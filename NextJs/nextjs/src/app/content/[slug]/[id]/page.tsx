import React from 'react'

export default function Content({ params }: { params: { slug: string, id: string } }) {
    return (
        <div>id : {params.slug} {params.id}</div>
    )
}
