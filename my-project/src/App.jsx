import React, { useRef, useState, useEffect } from "react";
import * as PANOLENS from "panolens";
import * as THREE from "three";
import TourCreate from "./pages/TourCreate";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tour from "./pages/Tour";
import TourUpdate from "./pages/TourUpdate";
import Carousel from "./pages/Carousel"
export default function App() {
  return (
    <div>
      <Carousel/>
    </div>
  );
}