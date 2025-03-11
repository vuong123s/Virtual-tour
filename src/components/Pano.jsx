import * as PANOLENS from "panolens";
console.log(PANOLENS);
const panorama = new PANOLENS.ImagePanorama("/bathroom.jpg");
console.log(panorama);
const viewer = new PANOLENS.Viewer({
  container: document.querySelector("#coucou")
});
console.log(viewer);
viewer.add(panorama);
const Pano = () => {
  return (
    <div>
      <p>Coucou</p>
      <div id="coucou" className=" w-full h-[500px] fixed top-0 left-0">
        {}
      </div>
    </div>
  );
};

export default Pano;