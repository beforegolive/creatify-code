// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import './index-func.scss'
import _ from 'lodash'
import dragImg1 from '../assets/dragimg1.jpeg'
import dragImg2 from '../assets/dragimg2.jpeg'
import dragImg3 from '../assets/dragimg3.jpeg'

// demo中的最大背景图片数
const maxImgInDemo = 9

let mouseDownItemId = ''
let mouseDownItemIndex = -1
let mouseDownItem = null
let mouseDownTrackId = ''
let clientXWhenMouseDown = undefined

const seperatorPrefix = 'pre-'
const outsidePrefix = 'outside-'

let _incId = 0
const createItem = (specificImgClassName = '', dynamicWidth = 0) => {
  _incId++
  return {
    id: `id-${_incId}`,
    content: `content ${_incId}`,
    dynamicWidth: dynamicWidth,
    specificImgClassName: specificImgClassName,
    index: _incId,
  }
}

const initialList = (total) =>
  Array.from({ length: total }, (v, k) => k).map((k, index) => {
    return createItem()
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
  const sourceClone = _.cloneDeep(source)
  // Array.from(source)
  const destClone = _.cloneDeep(destination)
  // Array.from(destination)
  const [removed] = sourceClone.splice(droppableSource.index, 1)

  destClone.splice(droppableDestination.index, 0, removed)

  const result = {}
  result[droppableSource.droppableId] = { items: sourceClone }
  result[droppableDestination.droppableId] = { items: destClone }

  return result
}

function Quote({ quote, index, trackId }) {
  const handleExtendFuncMouseDown = (e) => {
    console.log('=== onMouseDown id:', quote.id)
    mouseDownItemId = quote.id
    mouseDownItemIndex = index
    mouseDownItem = quote
    mouseDownTrackId = trackId
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
          const imgIndex = quote.index % maxImgInDemo
          const finalImIClassName = _.isEmpty(quote.specificImgClassName)
            ? `img${imgIndex}`
            : quote.specificImgClassName
          return (
            <div
              className={`quoteItem background ${finalImIClassName}`}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{ width: quote.dynamicWidth, ...provided.draggableProps.style }}
            >
              {/* {quote.content} */}
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

const draggableImgs = [
  {
    index: 101,
    id: `${outsidePrefix}img1`,
    src: dragImg1,
  },
  {
    index: 102,
    id: `${outsidePrefix}img2`,
    src: dragImg2,
  },
  {
    index: 103,
    id: `${outsidePrefix}img3`,
    src: dragImg3,
  },
]

const initMultiTrackItemsData = () => {
  const multiTrackList = initialList(7)
  const listObj = {
    track1: {
      items: multiTrackList.slice(0, 2),
    },
    track2: {
      items: multiTrackList.slice(2, 4),
    },
    track3: {
      items: multiTrackList.slice(4, 7),
    },
  }

  return listObj
}

let _incSeed = 1
const getNewTrackName = () => {
  return `newTrack${_incSeed++}`
}

function QuoteApp() {
  const [state, setState] = useState({ items: initialList(5) })
  const [trackList, setTrackList] = useState(['track1', 'track2', 'track3'])
  const initData = initMultiTrackItemsData()
  const [allTrackItemsObj, setAllTrackItemsObj] = useState(initData)

  const getItemListFromKey = (dropableId: string) => {
    return allTrackItemsObj[dropableId]?.items || []
  }

  console.log('=== allTrackItemsObj:', allTrackItemsObj)

  function onDragEnd(result) {
    const { source, destination, draggableId } = result
    console.log('=== result:', result)
    // 通过draggableId来判定是否从外面拖拽过来的
    if (draggableId.startsWith(outsidePrefix)) {
      console.log('== 外部资源拖拽')
      // 直接在目标列表创建新数据项，并指定特点背景图
      const clonedTrackItems = _.cloneDeep(allTrackItemsObj)
      const targetTrackLine = clonedTrackItems[destination.droppableId] || { items: [] }
      const newItem = createItem(draggableId)
      targetTrackLine.items.splice(destination.index, 0, newItem)
      const pendingResult = {}
      pendingResult[destination.droppableId] = targetTrackLine
      // result.splice(destination.index, 0, removed)
      const pendingTrackItemss = {
        ...clonedTrackItems,
        ...pendingResult,
      }

      console.log('=== pendingResult:', pendingResult)

      setAllTrackItemsObj(pendingTrackItemss)
      return
    }

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
      // 跨轨道拖拽
      console.log('=== sourceId:', source.droppableId, ' , targetId:', destination.droppableId)
      if (destination.droppableId.startsWith(seperatorPrefix)) {
        // 新建轨道逻辑
        console.log('=== 新建轨道')

        const targetTrackKey = _.trimStart(destination.droppableId, seperatorPrefix)
        const targetTrackIndex = trackList.indexOf(targetTrackKey)
        const pendingTrackList = _.cloneDeep(trackList)
        const newTrackName = getNewTrackName()
        pendingTrackList.splice(targetTrackIndex, 0, newTrackName)
        setTrackList(pendingTrackList)

        const sourceList = getItemListFromKey(source.droppableId)
        const newDestination = { ...destination, index: 0, droppableId: newTrackName }
        const destinationList = getItemListFromKey(newDestination.droppableId)
        console.log('== newDestination:', newDestination)
        console.log('== destinationList:', destinationList)
        const result = move(sourceList, destinationList, source, newDestination)
        const pendingData = { ...allTrackItemsObj, ...result }
        setAllTrackItemsObj(pendingData)

        console.log('== pendingTrackList:', pendingTrackList)

        return
      } else {
        // 跨轨道置换
        const sourceList = getItemListFromKey(source.droppableId)
        const destinationList = getItemListFromKey(destination.droppableId)
        console.log('== sourceItemList:', sourceList)
        console.log('== destinationList:', destinationList)
        const result = move(sourceList, destinationList, source, destination)
        const pendingData = { ...allTrackItemsObj, ...result }
        setAllTrackItemsObj(pendingData)
      }
    }
  }

  console.log('=== draggableImgs:', draggableImgs)
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
        const curTrackItems = allTrackItemsObj[mouseDownTrackId]
        const newList = updateItemInState(mouseDownItemIndex, curTrackItems.items, { dynamicWidth: diffX })
        console.log('=== newList:', newList)
        const pendingTrackItemsObj = _.cloneDeep(allTrackItemsObj)
        pendingTrackItemsObj[mouseDownTrackId].items = newList
        setAllTrackItemsObj(pendingTrackItemsObj)
        // setState({ items: newList })
      }}
      onMouseUp={() => {
        console.log('=== onMouseUp')
        mouseDownItemId = ''
        mouseDownTrackId = ''
        mouseDownItemIndex = -1
        clientXWhenMouseDown = undefined
        mouseDownItem = undefined
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <aside>
          <div className='imgPanel'>
            <Droppable className='imgPickArea' droppableId={'imgPickArea'} isDropDisabled={true}>
              {(provided, snapshot) => {
                {
                  return draggableImgs.map((imgItem, index) => {
                    return (
                      <section ref={provided.innerRef} key={imgItem.id}>
                        <Draggable draggableId={imgItem.id} index={imgItem.index}>
                          {(provided, snapshot) => {
                            // console.log('=== Draggable: provided', provided)
                            // console.log('=== Draggable: snapshot', snapshot)
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                // style={{ ...provided.draggableProps.style }}
                              >
                                <img src={imgItem.src} />
                                <p>{imgItem.id}</p>
                              </div>
                            )
                          }}
                        </Draggable>
                      </section>
                    )
                  })
                }
                // return (
                //   <div
                //     ref={provided.innerRef}
                //     {...provided.droppableProps}
                //     className={`droppableSeperator ${snapshot.isDraggingOver ? 'dropping' : ''}`}
                //   >
                //     {provided.placeholder}
                //   </div>
                // )
              }}
            </Droppable>
          </div>
        </aside>
        <section className='dropArea'>
          {trackList.map((trackId, index) => {
            const curItemList = allTrackItemsObj[trackId] || []
            if (_.isEmpty(curItemList) || _.isEmpty(curItemList.items)) {
              return null
            }
            console.log('== curItemList:', curItemList)
            const seperatorDroppableId = `${seperatorPrefix}${trackId}`
            return (
              <section key={`${trackId}+${index}`}>
                <Droppable
                  key={seperatorDroppableId}
                  className='preArea'
                  droppableId={seperatorDroppableId}
                  direction='horizontal'
                >
                  {(provided, snapshot) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`droppableSeperator ${snapshot.isDraggingOver ? 'dropping' : ''}`}
                      >
                        {provided.placeholder}
                      </div>
                    )
                  }}
                </Droppable>
                <Droppable key={trackId} className='dropList' droppableId={trackId} direction='horizontal'>
                  {(provided, snapshot) => {
                    return (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {/* <QuoteList items={state.items} /> */}
                        {curItemList?.items?.map((quote: QuoteType, index: number) => {
                          return (
                            <div key={quote.id}>
                              {/* <span>left</span> */}
                              <Quote quote={quote} index={index} trackId={trackId} />
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
            )
          })}
        </section>
      </DragDropContext>
    </section>
  )
}

export default QuoteApp
