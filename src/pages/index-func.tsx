// @ts-nocheck
import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import './index-func.scss'

const initial = Array.from({ length: 10 }, (v, k) => k).map((k) => {
  const custom = {
    id: `id-${k}`,
    content: `Quote ${k}`,
  }

  return custom
})

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

// const QuoteItem = styled.div`
//   width: 200px;
//   border: 1px solid grey;
//   margin-bottom: ${grid}px;
//   background-color: lightblue;
//   padding: ${grid}px;
// `

function Quote({ quote, index }) {
  return (
    <div className='itemWrapper'>
      {/* <span onClick={() => console.log('left')}>left</span> */}
      <Draggable draggableId={quote.id} index={index} disableInteractiveElementBlocking={false}>
        {(provided, snapshot) => {
          console.log('=== Draggable: provided', provided)
          console.log('=== Draggable: snapshot', snapshot)
          return (
            <div
              className='quoteItem'
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              {quote.content}
            </div>
          )
        }}
      </Draggable>
      {/* <span onClick={() => console.log(' right')}>right</span> */}
    </div>
  )
}

// const QuoteList = React.memo(function QuoteList({ quotes }) {

// })

function QuoteApp() {
  const [state, setState] = useState({ quotes: initial })

  function onDragEnd(result) {
    console.log('=== result:', result)
    if (!result.destination) {
      return
    }

    if (result.destination.index === result.source.index) {
      return
    }

    const quotes = reorder(state.quotes, result.source.index, result.destination.index)

    setState({ quotes })
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <section className='dropArea'>
        <Droppable className='dropList' droppableId='list' direction='horizontal'>
          {(provided, snapshot) => {
            console.log('*** Droppable provided:', provided)
            console.log('*** Droppable snapshot:', snapshot)
            return (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {/* <QuoteList quotes={state.quotes} /> */}
                {state.quotes.map((quote: QuoteType, index: number) => {
                  return (
                    <div key={quote.id}>
                      {/* <span>left</span> */}
                      <Quote quote={quote} index={index} />
                      {/* <span>right</span> */}
                    </div>
                  )
                })}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </section>
    </DragDropContext>
  )
}

export default QuoteApp
