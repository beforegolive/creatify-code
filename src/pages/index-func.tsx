// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import './index-func.scss'
import _ from 'lodash'

let mouseDownItemId = ''
let mouseDownItemIndex = -1
let mouseDownItem = null
let clientXWhenMouseDown = undefined

const initial = Array.from({ length: 10 }, (v, k) => k).map((k, index) => {
  const custom = {
    id: `id-${k}`,
    content: `Quote ${k}`,
    dynamicWidth: 0,
    index,
  }

  return custom
})

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const updateItemInState = (index, list, newProps) => {
  const clonedArr = _.cloneDeep(list)
  clonedArr[index] = { ...clonedArr[index], ...newProps }
  // clonedArr[index]=
  return clonedArr
}

function Quote({ quote, index }) {
  return (
    <div className='itemWrapper'>
      {/* <span className='itemHandle left' onClick={() => console.log('left')}>
        {'<'}
      </span> */}
      <Draggable draggableId={quote.id} index={index}>
        {(provided, snapshot) => {
          console.log('=== Draggable: provided', provided)
          console.log('=== Draggable: snapshot', snapshot)
          return (
            <div
              className='quoteItem'
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{ width: quote.dynamicWidth, ...provided.draggableProps.style }}
            >
              {quote.content} - {}
            </div>
          )
        }}
      </Draggable>
      <span
        className='itemHandle right'
        onClick={() => console.log(' right')}
        onMouseDown={(e) => {
          console.log('=== onMouseDown id:', quote.id)
          mouseDownItemId = quote.id
          mouseDownItemIndex = index
          mouseDownItem = quote
          clientXWhenMouseDown = e.nativeEvent.clientX
        }}
      >
        {'>'}
      </span>
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
    <section
      className='mainPage'
      onMouseMove={(e) => {
        if (_.isEmpty(mouseDownItemId) || clientXWhenMouseDown === undefined) {
          return
        }

        const curDiff = Math.max(0, mouseDownItem.dynamicWidth)
        const diffX = e.clientX - clientXWhenMouseDown + curDiff
        console.log('== onMouseMove diffX:', diffX)
        const newList = updateItemInState(mouseDownItemIndex, state.quotes, { dynamicWidth: diffX })
        setState({ quotes: newList })
      }}
      onMouseUp={() => {
        console.log('=== onMouseUp')
        mouseDownItemId = ''
        mouseDownItemIndex = -1
        clientXWhenMouseDown = undefined
        mouseDownItem = undefined
      }}
    >
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
    </section>
  )
}

export default QuoteApp
