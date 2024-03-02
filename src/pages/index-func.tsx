// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import './index-func.scss'
import _ from 'lodash'
import dragImg1 from '../assets/dragimg1.jpeg'
import dragImg2 from '../assets/dragimg2.jpeg'
import dragImg3 from '../assets/dragimg3.jpeg'

enum ExtendDirection {
  right = 0,
  left,
}

// demo中的最大背景图片数
const maxImgInDemo = 9

let mouseDownItemId = ''
let mouseDownItemIndex = -1
let mouseDownItem = null
let mouseDownItemPlaceHolderWith = 0
let mouseDownNextItemPlaceHolderWidth = 0
let mouseDownTrackId = ''
let clientXWhenMouseDown = undefined
// left or right
let curExtendDirection = ExtendDirection.right

const seperatorPrefix = 'pre-'
const outsidePrefix = 'outside-'

interface ICoreItem {
  id: string
  index: number
  content: string
  dynamicWidth: number
  specificImgClassName: string
  isPlaceHolder: boolean
  leftPlaceHolderWidth: number
}

let _incId = 0
const createItem = (specificImgClassName = '', dynamicWidth = 0, isPlaceHolder = false): ICoreItem => {
  _incId++
  return {
    id: `id-${_incId}`,
    index: _incId,
    isPlaceHolder,
    content: `${isPlaceHolder ? 'placeHolder' : 'normal'} ${_incId}`,
    dynamicWidth: dynamicWidth,
    specificImgClassName: specificImgClassName,
    leftPlaceHolderWidth: 0,
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

const thresHoldWidth = 5
const updateNextPlaceholdOnRightDirection = (targetIndex: number, targetList: ICoreItem[], diffX: number) => {
  const clonedTargetList = _.cloneDeep(targetList)
  // 往右时，最后项则直接返回null
  if (targetIndex === clonedTargetList.length - 1) {
    return clonedTargetList
  }

  const nextItemIndex = targetIndex + 1
  let nextItem = clonedTargetList[nextItemIndex]
  // const hasPlaceHolderItem = nextItem?.isPlaceHolder === true
  const { leftPlaceHolderWidth } = nextItem
  const curNextItemLeftPlaceHolderWith = mouseDownNextItemPlaceHolderWidth
  const absDiffX = Math.abs(diffX)
  if (diffX > 0) {
    console.log('=== 宽度扩大')
    // const finalPlaceHolderWidth = Math.max(leftPlaceHolderWidth - diffX, thresHoldWidth)
    const finalPlaceHolderWidth = Math.max(curNextItemLeftPlaceHolderWith - diffX, thresHoldWidth)
    // console.log(
    //   '=== leftPlaceHolderWidth:',
    //   leftPlaceHolderWidth,
    //   ', diffX:',
    //   diffX,
    //   ', finalPlaceHolderWidth:',
    //   finalPlaceHolderWidth
    // )
    // 宽度扩大
    // 当右侧数据占位宽度有值，则吞噬该宽度
    if (curNextItemLeftPlaceHolderWith > thresHoldWidth) {
      // const finalPlaceHolderWidth = Math.max(leftPlaceHolderWidth - absDiffX, thresHoldWidth)
      const pendingItem = { ...nextItem, leftPlaceHolderWidth: finalPlaceHolderWidth }
      clonedTargetList[nextItemIndex] = pendingItem
    }
  } else {
    console.log('=== 宽度减小')
    console.log('=== leftPlaceHolderWidth:', leftPlaceHolderWidth, ', diffX:', diffX)
    // 宽度减少

    const finalPlaceHolderWidth = Math.max(curNextItemLeftPlaceHolderWith + diffX, thresHoldWidth)
    const pendingItem = { ...nextItem, leftPlaceHolderWidth: finalPlaceHolderWidth }
    clonedTargetList[nextItemIndex] = pendingItem
  }

  return clonedTargetList
}

const updateNextPlaceholdOnLeftDirection = (targetIndex, targetList: ICoreItem[], diffX: number) => {
  const clonedTargetList = _.cloneDeep(targetList)
  const curItem = clonedTargetList[targetIndex]
  const { leftPlaceHolderWidth } = curItem

  // mouseDownItemPlaceHolderWith
  console.log('=== onLeft diffX:', diffX)

  let finalPlaceHolderWidth = thresHoldWidth
  if (diffX > 0) {
    finalPlaceHolderWidth = Math.max(mouseDownItemPlaceHolderWith + diffX, thresHoldWidth)
  } else {
    finalPlaceHolderWidth = Math.max(mouseDownItemPlaceHolderWith + diffX, thresHoldWidth)
  }
  console.log(
    '=== onLeft diffX:',
    diffX,
    ', leftPlaceHolderWidth:',
    leftPlaceHolderWidth,
    ', finalPlaceHolderWidth:',
    finalPlaceHolderWidth,
    ', mouseDownItemPlaceHolderWith:',
    mouseDownItemPlaceHolderWith
  )

  // console.log(
  //   '=== leftPlaceHolderWidth:',
  //   leftPlaceHolderWidth,
  //   ', absDiffX:',
  //   absDiffX,
  //   ', finalPlaceHolderWidth:',
  //   finalPlaceHolderWidth
  // )
  // if (diffX > 0) {
  // 宽度缩小
  // const finalWidth = Math.max(leftPlaceHolderWidth + diffX, thresHoldWidth)
  const pendingItem = { ...curItem, leftPlaceHolderWidth: finalPlaceHolderWidth }
  clonedTargetList[targetIndex] = pendingItem
  // } else {

  // }

  return clonedTargetList
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

function Quote({ quote, index, trackId, list }) {
  const handleExtendFuncMouseDown = (e, direction: ExtendDirection) => {
    mouseDownItemId = quote.id
    mouseDownItemIndex = index
    mouseDownItem = quote
    mouseDownTrackId = trackId
    clientXWhenMouseDown = e.nativeEvent.clientX
    curExtendDirection = direction
    mouseDownItemPlaceHolderWith = quote.leftPlaceHolderWidth
    mouseDownNextItemPlaceHolderWidth =
      index >= list.length - 1 ? thresHoldWidth : list[index + 1].leftPlaceHolderWidth
    console.log(
      '=== onMouseDown id:',
      quote.id,
      ' , clientXWhenMouseDown:',
      clientXWhenMouseDown,
      ', e.nativeEvent.clientX:',
      e.nativeEvent.clientX,
      ', e.clientX',
      e.clientX
    )
  }

  const { isPlaceHolder, leftPlaceHolderWidth } = quote

  return (
    <div className='itemWrapper'>
      <div className='placeHolder' style={{ width: leftPlaceHolderWidth }}></div>
      <span
        className='itemHandle left'
        onMouseDown={(e) => handleExtendFuncMouseDown(e, ExtendDirection.left)}
      >
        {'<'}
      </span>
      <Draggable draggableId={quote.id} index={index} isDragDisabled={isPlaceHolder}>
        {(provided, snapshot) => {
          if (isPlaceHolder) {
            return <div>123</div>
          }

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
            ></div>
          )
        }}
      </Draggable>
      <span
        className='itemHandle right'
        // onClick={() => console.log('right')}
        onMouseDown={(e) => handleExtendFuncMouseDown(e, ExtendDirection.right)}
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

const getNearByPlaceholder = (targetIndex, targetList, direction) => {
  if (direction === ExtendDirection.right) {
    // 往右时，最后项则直接返回null
    if (targetIndex === targetList.length - 1) {
      return null
    }

    const nextItem = targetList[targetIndex + 1]
    return nextItem?.isPlaceholder === true ? nextItem : null
  } else {
    // 往左时，第一项则直接返回null
    if (targetIndex === 0) {
      return null
    }

    const prevItem = targetList[targetIndex - 1]
    return prevItem?.isPlaceholder === true ? prevItem : null
  }
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

    if (!destination) {
      return
    }

    let curDestination = { ...destination }

    if (destination.droppableId.startsWith(seperatorPrefix)) {
      // 新建轨道逻辑
      console.log('=== 新建轨道')

      const targetTrackKey = _.trimStart(destination.droppableId, seperatorPrefix)
      const targetTrackIndex = trackList.indexOf(targetTrackKey)
      const pendingTrackList = _.cloneDeep(trackList)
      const newTrackName = getNewTrackName()
      pendingTrackList.splice(targetTrackIndex, 0, newTrackName)
      setTrackList(pendingTrackList)

      // 新建轨道后，目标信息要做调整
      curDestination = { ...destination, index: 0, droppableId: newTrackName }

      // const newDestination =
    }

    // 通过draggableId来判定是否从外面拖拽过来的
    if (draggableId.startsWith(outsidePrefix)) {
      console.log('== 外部资源拖拽')
      // 直接在目标列表创建新数据项，并指定特点背景图
      const clonedTrackItems = _.cloneDeep(allTrackItemsObj)
      const targetTrackLine = clonedTrackItems[curDestination.droppableId] || { items: [] }
      const newItem = createItem(draggableId)
      targetTrackLine.items.splice(curDestination.index, 0, newItem)
      const pendingResult = {}
      pendingResult[curDestination.droppableId] = targetTrackLine
      // result.splice(destination.index, 0, removed)
      const pendingTrackItemss = {
        ...clonedTrackItems,
        ...pendingResult,
      }

      setAllTrackItemsObj(pendingTrackItemss)
      return
    }

    // 单轨道内拖拽
    if (source.droppableId === curDestination.droppableId) {
      // 索引没变则不做处理
      if (curDestination.index === result.source.index) {
        return
      }

      const items = reorder(state.items, result.source.index, curDestination.index)

      setState({ items })
    } else {
      // 跨轨道拖拽
      console.log('=== sourceId:', source.droppableId, ' , targetId:', curDestination.droppableId)
      // if (destination.droppableId.startsWith(seperatorPrefix)) {
      //   // 新建轨道逻辑
      //   console.log('=== 新建轨道')

      //   const targetTrackKey = _.trimStart(destination.droppableId, seperatorPrefix)
      //   const targetTrackIndex = trackList.indexOf(targetTrackKey)
      //   const pendingTrackList = _.cloneDeep(trackList)
      //   const newTrackName = getNewTrackName()
      //   pendingTrackList.splice(targetTrackIndex, 0, newTrackName)
      //   setTrackList(pendingTrackList)

      //   const sourceList = getItemListFromKey(source.droppableId)
      //   const newDestination = { ...destination, index: 0, droppableId: newTrackName }
      //   const destinationList = getItemListFromKey(newDestination.droppableId)
      //   console.log('== newDestination:', newDestination)
      //   console.log('== destinationList:', destinationList)
      //   const result = move(sourceList, destinationList, source, newDestination)
      //   const pendingData = { ...allTrackItemsObj, ...result }
      //   setAllTrackItemsObj(pendingData)

      //   console.log('== pendingTrackList:', pendingTrackList)

      //   return
      // } else {
      // 跨轨道置换
      const sourceList = getItemListFromKey(source.droppableId)
      const destinationList = getItemListFromKey(curDestination.droppableId)
      console.log('== sourceItemList:', sourceList)
      console.log('== destinationList:', destinationList)
      const result = move(sourceList, destinationList, source, curDestination)
      const pendingData = { ...allTrackItemsObj, ...result }
      setAllTrackItemsObj(pendingData)
      // }
    }
  }

  return (
    <section
      className='mainPage'
      onMouseMove={(e) => {
        if (_.isEmpty(mouseDownItemId) || clientXWhenMouseDown === undefined) {
          return
        }

        // const isRightExtendDirection = curExtendDirection === ExtendDirection.right

        // const curDiff = Math.max(0, mouseDownItem.dynamicWidth)
        const curDynamicWidth = mouseDownItem.dynamicWidth
        // const targetDynamixX = e.clientX - clientXWhenMouseDown + curDiff
        const moveDiffX = e.clientX - clientXWhenMouseDown
        // const absMoveDiffX = Math.abs(moveDiffX)
        // console.log('== onMouseMove targetDynamixX:', targetDynamixX, ' , moveDiffX:', moveDiffX)
        const clonedTrackItemsObj = _.cloneDeep(allTrackItemsObj)
        const curTrackItems = clonedTrackItemsObj[mouseDownTrackId]
        // const curItem = curTrackItems[mouseDownItemIndex]

        const finalDynamicWidth =
          curExtendDirection === ExtendDirection.right
            ? curDynamicWidth + moveDiffX
            : Math.max(curDynamicWidth - moveDiffX, thresHoldWidth)
        // console.log(' ==== finalDynamicWidth:', finalDynamicWidth)
        let newList = updateItemInState(mouseDownItemIndex, curTrackItems.items, {
          dynamicWidth: finalDynamicWidth,
          // leftPlaceHolderWidth: finalLeftPlaceHolderWidth,
        })

        if (curExtendDirection === ExtendDirection.right) {
          newList = updateNextPlaceholdOnRightDirection(mouseDownItemIndex, newList, moveDiffX)
        } else {
          newList = updateNextPlaceholdOnLeftDirection(mouseDownItemIndex, newList, moveDiffX)
        }

        console.log('=== newList:', newList)

        // const curTrackItems = allTrackItemsObj[mouseDownTrackId]

        console.log('=== newList:', newList)
        const pendingTrackItemsObj = _.cloneDeep(allTrackItemsObj)
        pendingTrackItemsObj[mouseDownTrackId].items = newList
        setAllTrackItemsObj(pendingTrackItemsObj)
      }}
      onMouseUp={() => {
        console.log('=== onMouseUp')
        mouseDownItemId = ''
        mouseDownTrackId = ''
        mouseDownItemIndex = -1
        clientXWhenMouseDown = undefined
        mouseDownItemPlaceHolderWith = 0
        mouseDownNextItemPlaceHolderWidth = 0
        mouseDownItem = undefined
        curExtendDirection = undefined
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
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
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
            // console.log('== curItemList:', curItemList)
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
                              <Quote
                                quote={quote}
                                index={index}
                                trackId={trackId}
                                list={curItemList?.items}
                              />
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
