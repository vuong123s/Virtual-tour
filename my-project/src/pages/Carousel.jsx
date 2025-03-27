import React, { useRef, useEffect } from 'react';


function Carousel() {
  const nextRef = useRef(null);
  const prevRef = useRef(null);
  const carouselRef = useRef(null);
  const sliderRef = useRef(null);
  const thumbnailBorderRef = useRef(null);

  useEffect(() => {
    const nextDom = nextRef.current;
    const prevDom = prevRef.current;
    const carouselDom = carouselRef.current;
    const sliderDom = sliderRef.current;
    const thumbnailBorderDom = thumbnailBorderRef.current;

    const thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');
    thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);

    const timeRunning = 3000;
    const timeAutoNext = 7000;

    const showSlider = (type) => {
      const sliderItemsDom = sliderDom.querySelectorAll('.item');
      const thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');

      if (type === 'next') {
        sliderDom.appendChild(sliderItemsDom[0]);
        thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
        carouselDom.classList.add('next');
      } else {
        sliderDom.prepend(sliderItemsDom[sliderItemsDom.length - 1]);
        thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
        carouselDom.classList.add('prev');
      }

      clearTimeout(runTimeOut);
      runTimeOut = setTimeout(() => {
        carouselDom.classList.remove('next');
        carouselDom.classList.remove('prev');
      }, timeRunning);

      clearTimeout(runNextAuto);
      runNextAuto = setTimeout(() => {
        nextDom.click();
      }, timeAutoNext);
    };

    nextDom.onclick = () => showSlider('next');
    prevDom.onclick = () => showSlider('prev');

    let runTimeOut;
    let runNextAuto = setTimeout(() => {
      nextDom.click();
    }, timeAutoNext);

    return () => {
      clearTimeout(runTimeOut);
      clearTimeout(runNextAuto);
    };
  }, []);

  return (
    <div className="carousel" ref={carouselRef}>
      <div className="list" ref={sliderRef}>
        <div className="item">
          <img src="./src/assets/image/img1.jpg" alt="Mons City" />
          <div className="content">
            <div className="title">LANDSCAPE</div>
            <div className="topic">MONS CITY</div>
            <div className="des">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut sequi, rem magnam nesciunt minima placeat, itaque eum neque officiis unde, eaque optio ratione aliquid assumenda facere ab et quasi ducimus aut doloribus non numquam. Explicabo, laboriosam nisi reprehenderit tempora at laborum natus unde. Ut, exercitationem eum aperiam illo illum laudantium?
            </div>
            <div className="buttons">
              <button>EXPLORE</button>
              <button>ABOUT</button>
            </div>
          </div>
        </div>
        <div className="item">
          <img src="./src/assets/image/img2.jpg" alt="Mountain" />
          <div className="content">
            <div className="title">LANDSCAPE</div>
            <div className="topic">MOUNTAIN</div>
            <div className="des">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut sequi, rem magnam nesciunt minima placeat, itaque eum neque officiis unde, eaque optio ratione aliquid assumenda facere ab et quasi ducimus aut doloribus non numquam. Explicabo, laboriosam nisi reprehenderit tempora at laborum natus unde. Ut, exercitationem eum aperiam illo illum laudantium?
            </div>
            <div className="buttons">
              <button>EXPLORE</button>
              <button>ABOUT</button>
            </div>
          </div>
        </div>
        <div className="item">
          <img src="./src/assets/image/img3.jpg" alt="Mons" />
          <div className="content">
            <div className="title">LANDSCAPE</div>
            <div className="topic">MONS</div>
            <div className="des">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut sequi, rem magnam nesciunt minima placeat, itaque eum neque officiis unde, eaque optio ratione aliquid assumenda facere ab et quasi ducimus aut doloribus non numquam. Explicabo, laboriosam nisi reprehenderit tempora at laborum natus unde. Ut, exercitationem eum aperiam illo illum laudantium?
            </div>
            <div className="buttons">
              <button>EXPLORE</button>
              <button>ABOUT</button>
            </div>
          </div>
        </div>
        <div className="item">
          <img src="./src/assets/image/img4.jpg" alt="Mons" />
          <div className="content">
            <div className="title">LANDSCAPE</div>
            <div className="topic">MONS</div>
            <div className="des">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut sequi, rem magnam nesciunt minima placeat, itaque eum neque officiis unde, eaque optio ratione aliquid assumenda facere ab et quasi ducimus aut doloribus non numquam. Explicabo, laboriosam nisi reprehenderit tempora at laborum natus unde. Ut, exercitationem eum aperiam illo illum laudantium?
            </div>
            <div className="buttons">
              <button>EXPLORE</button>
              <button>ABOUT</button>
            </div>
          </div>
        </div>
      </div>
      <div className="thumbnail" ref={thumbnailBorderRef}>
        <div className="item">
          <img src="./src/assets/image/img1.jpg" alt="Mons City" />
          <div className="content">
            <div className="title">MONS CITY</div>
            <div className="description">Description</div>
          </div>
        </div>
        <div className="item">
          <img src="./src/assets/image/img2.jpg" alt="Mountain" />
          <div className="content">
            <div className="title">MOUNTAIN</div>
            <div className="description">Description</div>
          </div>
        </div>
        <div className="item">
          <img src="./src/assets/image/img3.jpg" alt="Mons" />
          <div className="content">
            <div className="title">MONS</div>
            <div className="description">Description</div>
          </div>
        </div>
        <div className="item">
          <img src="./src/assets/image/img4.jpg" alt="Mons" />
          <div className="content">
            <div className="title">MONS</div>
            <div className="description">Description</div>
          </div>
        </div>
      </div>
      <div className="arrows">
            <button id="prev" ref={prevRef}> &lt; </button>
            <button id="next" ref={nextRef}> &gt; </button>
        </div>
      <div className="time"></div>
    </div>
  );
}

export default Carousel;