"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from "../components/sidebar";
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '7847311827:AAFzrC4rpUb5A3owFNk4eKLKsXf9IRXQM9Y';
const TELEGRAM_CHAT_ID = '-1002157320382';

// Full camera trap site data from CSV
const cameraTrapSites = [
    {site_name: "0002-A", coordinate_x: 506314, coordinate_y: 17234, elevation_m: 279, forestCover_: 95},
    {site_name: "0002-B", coordinate_x: 516314, coordinate_y: 160293, elevation_m: 308, forestCover_: 97},
    {site_name: "0002-C", coordinate_x: 516300, coordinate_y: 183558, elevation_m: 374, forestCover_: 93},
    {site_name: "0002-D", coordinate_x: 576300, coordinate_y: 179063, elevation_m: 382, forestCover_: 97},
    {site_name: "0002-E", coordinate_x: 506300, coordinate_y: 179349, elevation_m: 471, forestCover_: 93},
    {site_name: "0002-F", coordinate_x: 536300, coordinate_y: 177877, elevation_m: 336, forestCover_: 98},
    {site_name: "0002-G", coordinate_x: 536300, coordinate_y: 178106, elevation_m: 453, forestCover_: 91},
    {site_name: "0002-H", coordinate_x: 556300, coordinate_y: 176788, elevation_m: 356, forestCover_: 97},
    {site_name: "0002-I", coordinate_x: 436300, coordinate_y: 176590, elevation_m: 531, forestCover_: 91},
    {site_name: "0003-A", coordinate_x: 496224, coordinate_y: 175612, elevation_m: 337, forestCover_: 98},
    {site_name: "0003-B", coordinate_x: 496143, coordinate_y: 174576, elevation_m: 337, forestCover_: 98},
    {site_name: "0003-C", coordinate_x: 408306, coordinate_y: 177608, elevation_m: 558, forestCover_: 95},
    {site_name: "0004-A", coordinate_x: 115275, coordinate_y: 175778, elevation_m: 439, forestCover_: 98},
    {site_name: "0004-B", coordinate_x: 113813, coordinate_y: 174554, elevation_m: 297, forestCover_: 98},
    {site_name: "0004-C", coordinate_x: 155300, coordinate_y: 213262, elevation_m: 648, forestCover_: 94},
    {site_name: "0005-A", coordinate_x: 262944, coordinate_y: 212270, elevation_m: 667, forestCover_: 98},
    {site_name: "0005-B", coordinate_x: 262021, coordinate_y: 211631, elevation_m: 667, forestCover_: 98},
    {site_name: "0005-C", coordinate_x: 264004, coordinate_y: 143999, elevation_m: 15, forestCover_: 92},
    {site_name: "0006-A", coordinate_x: 261010, coordinate_y: 138989, elevation_m: 104, forestCover_: 89},
    {site_name: "0006-B", coordinate_x: 263049, coordinate_y: 139042, elevation_m: 549, forestCover_: 94}
];

// Function to convert local coordinates to approximate lat/long
const convertToLatLong = (x, y) => {
    // Find the bounds of your coordinate system
    const minX = Math.min(...cameraTrapSites.map(site => site.coordinate_x));
    const maxX = Math.max(...cameraTrapSites.map(site => site.coordinate_x));
    const minY = Math.min(...cameraTrapSites.map(site => site.coordinate_y));
    const maxY = Math.max(...cameraTrapSites.map(site => site.coordinate_y));

    // Calculate the coordinate ranges
    const xRange = maxX - minX;
    const yRange = maxY - minY;

    // Define the bounds of your map area (Semenggoh Wildlife Park)
    const mapBounds = {
        minLat: 1.3633702157569563,
        maxLat: 1.4222533623841092,
        minLong: 110.26688737553334,
        maxLong: 110.32660296077707
    };

    // Convert to lat/long
    const lat = mapBounds.minLat + ((y - minY) / yRange) * (mapBounds.maxLat - mapBounds.minLat);
    const long = mapBounds.minLong + ((x - minX) / xRange) * (mapBounds.maxLong - mapBounds.minLong);

    return [lat, long];
};

export default function Dashboard() {
    const [mapCenter, setMapCenter] = useState([1.3845043763517921, 110.29892039383745]);
    const [zoomLevel, setZoomLevel] = useState(13);
    const [pinpoints, setPinpoints] = useState([]);
    const [selectedSite, setSelectedSite] = useState(null);

    const [regions, setRegions] = useState([
        { id: 1, name: "Semonggoh Wildlife Park", positions: [
            [1.418991652472288, 110.30704095871451],
            [1.4196783286257997, 110.29966230881367],
            [1.4133265664365962, 110.29863272975778],
            [1.4105798530776525, 110.29846113324844],
            [1.409549834731779, 110.29554399258997],
            [1.4073181267530879, 110.29708836117388],
            [1.4054297567952703, 110.29657357164591],
            [1.4047430764319255, 110.29846113324844],
            [1.4037130555085306, 110.29725995768318],
            [1.3928978084816899, 110.29674516815523],
            [1.389807728768143, 110.29623037862726],
            [1.3906660846500836, 110.2917688693849],
            [1.3908377557890175, 110.28988130778238],
            [1.3925544664912424, 110.28936651825443],
            [1.3930694794581482, 110.28988130778238],
            [1.3953012010133423, 110.28953811476376],
            [1.3958162133793526, 110.28885172872646],
            [1.397017908461351, 110.28885172872646],
            [1.3977045910893906, 110.29056769381964],
            [1.3977045910893906, 110.2917688693849],
            [1.3968462377729745, 110.29399962400608],
            [1.400451319592609, 110.29382802749676],
            [1.4025113638577908, 110.29297004495014],
            [1.404228066026982, 110.29451441353405],
            [1.404228066026982, 110.29520079957135],
            [1.4056014268545585, 110.2958871856086],
            [1.4080048063587356, 110.29554399258997],
            [1.4078331364762988, 110.29468601004338],
            [1.4088631555813833, 110.29228365891285],
            [1.4086914857621253, 110.29142567636625],
            [1.4073181267530879, 110.29005290429173],
            [1.4074897966734623, 110.28799374617985],
            [1.4061164369567134, 110.28576299155867],
            [1.4061164369567134, 110.28421862297478],
            [1.404914746541683, 110.28250265788154],
            [1.4019963529614132, 110.2819878683536],
            [1.403026374640839, 110.2843902194841],
            [1.4009663308287588, 110.2843902194841],
            [1.3999363082432694, 110.28387542995613],
            [1.398562944092064, 110.28284585090019],
            [1.3953012010133423, 110.28233106137222],
            [1.3940995050542107, 110.28164467533495],
            [1.3954728718145395, 110.27769795562057],
            [1.3937561632389226, 110.27615358703669],
            [1.3911810980294312, 110.2770115695833],
            [1.3913527691308982, 110.28130148231632],
            [1.389979399969492, 110.28181627184426],
            [1.3894643863280034, 110.27958551722313],
            [1.3896360575543134, 110.27666837656466],
            [1.3913527691308982, 110.27409442892481],
            [1.3927261374927127, 110.27426602543413],
            [1.3942711759430766, 110.27255006034098],
            [1.3939278341528132, 110.27100569175707],
            [1.3910094269154838, 110.27357963939686],
            [1.3874043306395665, 110.27375123590616],
            [1.3832842138836245, 110.27289325335957],
            [1.3747006143550395, 110.27066249873842],
            [1.3771040253419498, 110.26791695458928],
            [1.3762456645532146, 110.26688737553334],
            [1.371610510960342, 110.26860334062657],
            [1.3698937851273534, 110.27066249873842],
            [1.3680053852904128, 110.27306484986889],
            [1.3664603297727345, 110.27752635911126],
            [1.3633702157569563, 110.28027190326041],
            [1.361481810794132, 110.28250265788154],
            [1.3565032815341829, 110.28627778108662],
            [1.3546148712021115, 110.29091088683829],
            [1.3561599343106416, 110.29194046589421],
            [1.3587350372990414, 110.29194046589421],
            [1.357876669940998, 110.29365643098744],
            [1.359765077726043, 110.29760315070185],
            [1.361481810794132, 110.2982895367391],
            [1.3630268695102015, 110.29554399258997],
            [1.3652586192384946, 110.29451441353405],
            [1.3693787671375248, 110.29605878211794],
            [1.3697221124763712, 110.30000550183229],
            [1.3700654577660207, 110.30189306343483],
            [1.3692070944496608, 110.3061829761679],
            [1.3673186940719877, 110.30875692380768],
            [1.3671470212366859, 110.31270364352208],
            [1.3681770580643045, 110.31630717021781],
            [1.3697221124763712, 110.3171651527644],
            [1.3705804756082463, 110.3151059946526],
            [1.371953855979199, 110.31544918767122],
            [1.372468873415077, 110.31939590738558],
            [1.372983890740068, 110.32282783757204],
            [1.374528942049071, 110.32248464455338],
            [1.3747006143550395, 110.32488699568388],
            [1.3734989079540831, 110.32643136426773],
            [1.3748722866486802, 110.32660296077707],
            [1.3759023201511944, 110.32368582011864],
            [1.3757306479316607, 110.3217982585161],
            [1.374528942049071, 110.32025388993222],
            [1.375387303455508, 110.31905271436695],
            [1.377275697462619, 110.31870952134831],
            [1.378305729926822, 110.3151059946526],
            [1.3815674964559006, 110.31253204701275],
            [1.3824258553249165, 110.31304683654072],
            [1.384314243744162, 110.3151059946526],
            [1.3836275572201717, 110.31973910040425],
            [1.3850009300692656, 110.32196985502542],
            [1.386202630659374, 110.32214145153475],
            [1.3863743021224701, 110.32076867946016],
            [1.3858592876958422, 110.31750834578304],
            [1.3874043306395665, 110.31785153880169],
            [1.3892927150892254, 110.32042548644151],
            [1.3892927150892254, 110.32299943408135],
            [1.3911810980294312, 110.32385741662794],
            [1.3942711759430766, 110.32454380266525],
            [1.397532920451203, 110.3242006096466],
            [1.401138001215644, 110.32488699568388],
            [1.4033697150998874, 110.32385741662794],
            [1.4068031169161404, 110.32265624106272],
            [1.409549834731779, 110.32231304804407],
            [1.411438201350943, 110.32196985502542],
            [1.413841574829928, 110.32162666200678],
            [1.4150432606366148, 110.32454380266525],
            [1.4159016072602533, 110.32591657473978],
            [1.4177899687132043, 110.3242006096466],
            [1.418991652472288, 110.32282783757204],
            [1.4