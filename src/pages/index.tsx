// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import './index.scss'
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
  // isPlaceHolder: boolean
  leftPlaceHolderWidth: number
}

let _incId = 0
const createItem = (specificImgClassName = '', dynamicWidth = 0): ICoreItem => {
  _incId++
  return {
    id: `id-${_incId}`,
    index: _incId,
    content: `item ${_incId}`,
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

  const { leftPlaceHolderWidth } = nextItem
  const curNextItemLeftPlaceHolderWith = mouseDownNextItemPlaceHolderWidth

  if (diffX > 0) {
    const finalPlaceHolderWidth = Math.max(curNextItemLeftPlaceHolderWith - diffX, thresHoldWidth)

    if (curNextItemLeftPlaceHolderWith > thresHoldWidth) {
      const pendingItem = { ...nextItem, leftPlaceHolderWidth: finalPlaceHolderWidth }
      clonedTargetList[nextItemIndex] = pendingItem
    }
  } else {
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

  let finalPlaceHolderWidth = thresHoldWidth
  if (diffX > 0) {
    finalPlaceHolderWidth = Math.max(mouseDownItemPlaceHolderWith + diffX, thresHoldWidth)
  } else {
    finalPlaceHolderWidth = Math.max(mouseDownItemPlaceHolderWith + diffX, thresHoldWidth)
  }

  const pendingItem = { ...curItem, leftPlaceHolderWidth: finalPlaceHolderWidth }
  clonedTargetList[targetIndex] = pendingItem

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

// 外部图片资源
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
  const multiTrackList = initialList(6)
  const listObj = {
    track1: {
      items: multiTrackList.slice(0, 1),
    },
    track2: {
      items: multiTrackList.slice(1, 3),
    },
    track3: {
      items: multiTrackList.slice(3, 6),
    },
  }

  return listObj
}

let _incTrackSeed = 1
const getNewTrackName = () => {
  return `newTrack${_incTrackSeed++}`
}

/** 主应用实体 */
function QuoteApp() {
  const [state, setState] = useState({ items: initialList(5) })
  const [trackList, setTrackList] = useState(['track1', 'track2', 'track3'])
  const initData = initMultiTrackItemsData()
  const [allTrackItemsObj, setAllTrackItemsObj] = useState(initData)
  const [draggingItemId, setDraggingItemId] = useState('')

  /** 通过落下的轨道Id获取对应轨道内的数据列表 */
  const getItemListFromKey = (dropableId: string) => {
    return allTrackItemsObj[dropableId]?.items || []
  }

  /** 可拖拽的单个实体项 */
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
    }

    const { leftPlaceHolderWidth } = quote
    const isCurrItemDragging = quote.id === draggingItemId

    return (
      <div className='itemWrapper'>
        {!isCurrItemDragging && (
          <>
            {/* 每个数据项左侧的占位符，用于配合扩展按钮交互 */}
            <div className='placeHolder' style={{ width: leftPlaceHolderWidth }}></div>
            <span
              className='itemHandle left'
              onMouseDown={(e) => handleExtendFuncMouseDown(e, ExtendDirection.left)}
            >
              {'<'}
            </span>
          </>
        )}
        <Draggable draggableId={quote.id} index={index}>
          {(provided, snapshot) => {
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
        {!isCurrItemDragging && (
          <span
            className='itemHandle right'
            onMouseDown={(e) => handleExtendFuncMouseDown(e, ExtendDirection.right)}
          >
            {'>'}
          </span>
        )}
      </div>
    )
  }

  function onDragEnd(result) {
    const { source, destination, draggableId } = result

    setDraggingItemId('')

    if (!destination) {
      return
    }

    let curDestination = { ...destination }

    // 如果拖拽项落在轨道间隔处，则创建新的轨道，同时更新目标轨道信息
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

    // 通过draggableId的前缀来判定是否外部资源拖拽过来的
    if (draggableId.startsWith(outsidePrefix)) {
      console.log('== 外部资源拖拽')
      // 直接在目标列表创建新数据项，并指定外部资源的背景图
      const clonedTrackItems = _.cloneDeep(allTrackItemsObj)
      const targetTrackLine = clonedTrackItems[curDestination.droppableId] || { items: [] }
      const newItem = createItem(draggableId)
      targetTrackLine.items.splice(curDestination.index, 0, newItem)
      const pendingResult = {}
      pendingResult[curDestination.droppableId] = targetTrackLine
      const pendingTrackItemss = {
        ...clonedTrackItems,
        ...pendingResult,
      }

      setAllTrackItemsObj(pendingTrackItemss)
      return
    }

    // 单轨道内拖拽，直接列表间重新排序即可
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
      const sourceList = getItemListFromKey(source.droppableId)
      const destinationList = getItemListFromKey(curDestination.droppableId)

      const result = move(sourceList, destinationList, source, curDestination)
      const pendingData = { ...allTrackItemsObj, ...result }
      setAllTrackItemsObj(pendingData)
    }
  }

  return (
    <section
      className='mainPage'
      onMouseMove={(e) => {
        // 【核心方法】点击左右扩展按钮修改拖动项和占位符的宽度
        // 注意！左右两边扩展按钮拖动时逻辑不同，要分别处理
        if (_.isEmpty(mouseDownItemId) || clientXWhenMouseDown === undefined) {
          return
        }

        const curDynamicWidth = mouseDownItem.dynamicWidth

        const moveDiffX = e.clientX - clientXWhenMouseDown

        const clonedTrackItemsObj = _.cloneDeep(allTrackItemsObj)
        const curTrackItems = clonedTrackItemsObj[mouseDownTrackId]

        const finalDynamicWidth =
          curExtendDirection === ExtendDirection.right
            ? curDynamicWidth + moveDiffX
            : Math.max(curDynamicWidth - moveDiffX, thresHoldWidth)

        let newList = updateItemInState(mouseDownItemIndex, curTrackItems.items, {
          dynamicWidth: finalDynamicWidth,
        })

        if (curExtendDirection === ExtendDirection.right) {
          newList = updateNextPlaceholdOnRightDirection(mouseDownItemIndex, newList, moveDiffX)
        } else {
          newList = updateNextPlaceholdOnLeftDirection(mouseDownItemIndex, newList, moveDiffX)
        }

        const pendingTrackItemsObj = _.cloneDeep(allTrackItemsObj)
        pendingTrackItemsObj[mouseDownTrackId].items = newList
        setAllTrackItemsObj(pendingTrackItemsObj)
      }}
      onMouseUp={() => {
        // 扩展按钮点击放开的逻辑，和mouseDown对应，用于相应变量重置
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
      <DragDropContext
        onDragEnd={onDragEnd}
        onBeforeDragStart={(e) => {
          setDraggingItemId(e.draggableId)
        }}
      >
        <aside>
          {/* 外部资源区域 */}
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
                {/* 用于拖动放置的轨道间占位空间，用于拖动时创建新轨道 */}
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
                {/* 用于拖动放置的轨道区域展示 */}
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
