import React, { useState} from 'react';
import { Gif } from '@giphy/react-components'
import { getGifHeight } from '@giphy/js-util'
import MasonryGrid from './masonry-grid'
import './Gallery.css'


function Gallery(props){
    const [modalGif, setModalGif] = useState();
    const widthIn = window.innerWidth;
    const gutter = 6;
    const columns = 5;
    const gutterOffset = gutter * (columns - 1)
    const gifWidth = Math.floor((widthIn - gutterOffset) / columns)
    const itemHeights = props.gifs.map((gif) => getGifHeight(gif.gif.data, gifWidth))
  
    const GifClick = (gif, e) => {
      e.preventDefault();
      setModalGif(gif);}
  
    return(
      <div>
      <MasonryGrid 
        itemHeights={itemHeights}
        itemWidth={gifWidth}
        columns={columns}
        gutter={gutter}
        >
  
        {props.gifs.map((dto) => {
          return (
          dto && <Gif onGifClick ={GifClick}gif={dto.gif.data} width={Math.floor((widthIn - gutterOffset) / columns)} key={dto.gif.data.id } />)})}
      </MasonryGrid>
            {modalGif && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(0, 0, 0, .8)"
                }}
                onClick={e => {
                  e.preventDefault();
                  setModalGif(undefined);
                }}
              >
                <Gif gif={modalGif} width={gifWidth} />
              </div>
            )}
            </div>
    )
  }

  export default Gallery;