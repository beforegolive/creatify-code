// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import './index-func.scss'
import _ from 'lodash'

let mouseDownItemId = ''
let mouseDownItemIndex = -1
let mouseDownItem = null
let clientXWhenMouseDown = undefined

const initialList = (total) =>
  Array.from({ length: total }, (v, k) => k).map((k, index) => {
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

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = _.clone(source, true)
  // Array.from(source)
  const destClone = _.clone(destination, true)
  // Array.from(destination)
  const [removed] = sourceClone.splice(droppableSource.index, 1)

  destClone.splice(droppableDestination.index, 0, removed)

  const result = {}
  result[droppableSource.droppableId] = { items: sourceClone }
  result[droppableDestination.droppableId] = { items: destClone }

  return result
}

function Quote({ quote, index }) {
  const handleExtendFuncMouseDown = (e) => {
    console.log('=== onMouseDown id:', quote.id)
    mouseDownItemId = quote.id
    mouseDownItemIndex = index
    mouseDownItem = quote
    clientXWhenMouseDown = e.nativeEvent.clientX
  }
  return (
    <div className='itemWrapper'>
      <span className='itemHandle left' onClick={handleExtendFuncMouseDown}>
        {'<'}
      </span>
      <Draggable draggableId={quote.id} index={index}>
        {(provided, snapshot) => {
          // console.log('=== Draggable: provided', provided)
          // console.log('=== Draggable: snapshot', snapshot)
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
        onMouseDown={handleExtendFuncMouseDown}
      >
        {'>'}
      </span>
    </div>
  )
}

// const QuoteList = React.memo(function QuoteList({ items }) {

// })

const initMultiTrackItemsData = () => {
  const multiTrackList = initialList(12)
  const listObj = {
    track1: {
      items: multiTrackList.slice(0, 4),
    },
    track2: {
      items: multiTrackList.slice(4, 8),
    },
    track3: {
      items: multiTrackList.slice(8, 12),
    },
  }

  return listObj
}

function QuoteApp() {
  const [state, setState] = useState({ items: initialList(5) })
  const [trackList, setTrackList] = useState(['track1', 'track2', 'track3'])
  const initData = initMultiTrackItemsData()
  const [allTrackItemsObj, setAllTrackItemsObj] = useState(initData)

  const getItemListFromKey = (dropableId: string) => {
    return allTrackItemsObj[dropableId]?.items
  }

  console.log('=== allTrackItemsObj:', allTrackItemsObj)

  function onDragEnd(result) {
    const { source, destination } = result
    console.log('=== result:', result)
    if (!destination) {
      return
    }
    // 单轨道内拖拽
    if (source.droppableId === destination.droppableId) {
      // 索引没变则不做处理
      if (result.destination.index === result.source.index) {
        return
      }

      const items = reorder(state.items, result.source.index, result.destination.index)

      setState({ items })
    } else {
      console.log('=== sourceId:', source.droppableId, ' , targetId:', destination.droppableId)
      const sourceList = getItemListFromKey(source.droppableId)
      const destinationList = getItemListFromKey(destination.droppableId)
      console.log('== sourceItemList:', sourceList)
      console.log('== destinationList:', destinationList)
      const result = move(sourceList, destinationList, source, destination)
      const pendingData = { ...allTrackItemsObj, ...result }
      setAllTrackItemsObj(pendingData)
      // 跨轨道拖拽
    }
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
        const newList = updateItemInState(mouseDownItemIndex, state.items, { dynamicWidth: diffX })
        setState({ items: newList })
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
          {trackList.map((trackId, index) => {
            const curItemList = allTrackItemsObj[trackId]
            console.log('== curItemList:', curItemList)
            return (
              <Droppable key={trackId} className='dropList' droppableId={trackId} direction='horizontal'>
                {(provided, snapshot) => {
                  // console.log('*** Droppable provided:', provided)
                  // console.log('*** Droppable snapshot:', snapshot)
                  return (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {/* <QuoteList items={state.items} /> */}
                      {curItemList.items.map((quote: QuoteType, index: number) => {
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
            )
          })}
        </section>
      </DragDropContext>
    </section>
  )
}

export default QuoteApp
