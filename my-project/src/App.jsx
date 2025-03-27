import React, { useRef, useState, useEffect } from "react";
import * as PANOLENS from "panolens";
import * as THREE from "three";
import TourCreate from "./pages/TourCreate";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tour from "./pages/Tour";
import TourUpdate from "./pages/TourUpdate";
export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<Home />} />
        <Route path="/tour/:tourId" element={<Tour />} />
        <Route path="/tour-update/:tourId" element={<TourUpdate />} />
        <Route path="/tour-create" element={<TourCreate />} />
      </Routes>
    </div>
  );
}