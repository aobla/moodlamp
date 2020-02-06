'use strict';

let ledCharacteristic = [];
let turnedOn = false;
let ColorWheel = null;
let WhiteSlider = null;
// let oldColor = null;
// let mouseIsDown = false;

let pwrButtonColorOn = "#ffcc66";
let pwrButtonColorOff = "#a6a6a6";


ColorWheel = iro.ColorPicker("#color-picker", {
	width: 280,
	padding: 2,
	sliderMargin: 30,
	handleRadius: 8,
	color: "rgb(255, 255, 255)",
	borderWidth: 0,
	// styles: {
	// 	".on-off": {
	// 		"background-color": "rgb"
	// 	},
	// 	".on-off:hover": {
	// 		"background-color": "rgb"
	// 	}
	// }
});

WhiteSlider = iro.ColorPicker("#white-slider", {
	width: 280,
	padding: 2,
	sliderMargin: 30,
	handleRadius: 8,
	borderWidth: 0,
	layout: [
		{
		  component: iro.ui.Slider,
		  options: {}
		}
	]
});








// document.querySelector('.wheel').addEventListener('mousedown', function (e) {
// 	handleMouseDown(e);
// }, false);
// document.querySelector('.wheel').addEventListener('mousemove', function (e) {
// 	handleMouseMove(e);
// }, false);
// document.querySelector('.wheel').addEventListener('mouseup', function (e) {
// 	handleMouseUp(e);
// }, false);


// function handleMouseDown(e) {

// 	// mousedown stuff here
// 	mouseIsDown = true;
// }

// function handleMouseUp(e) {
// 	updateColor();

// 	// mouseup stuff here
// 	mouseIsDown = false;
// }

// function handleMouseMove(e) {
// 	if (!mouseIsDown) {
// 		return;
// 	}

// 	updateColor();
// }

// function updateColor() {
// 	if (oldColor != null && oldColor != "" && oldColor != ColorWheel.color.rgbString) {
// 		setColor(ColorWheel.color.rgb.r, ColorWheel.color.rgb.g, ColorWheel.color.rgb.b);
// 	}
// 	oldColor = ColorWheel.color.rgbString;
// }



var values = document.getElementById("values");

// https://iro.js.org/guide.html#color-picker-events
ColorWheel.on(["color:init", "color:change"], function(color){
  // Show the current color in different formats
  // Using the selected color: https://iro.js.org/guide.html#selected-color-api
  values.innerHTML = [
    "hex: " + color.hexString,
    "rgb: " + color.rgbString,
    "hsl: " + color.hslString,
  ].join("<br>");
});


function onConnected() {
	// document.querySelector('.connect-button').classList.add('hidden');
	// document.querySelector('.connect-another').classList.remove('hidden');
	// document.querySelector('.wheel').classList.remove('hidden');
	// document.querySelector('.mic-button').classList.remove('hidden');
	//document.querySelector('.power-button').classList.remove('hidden');
	document.getElementById('power-button').classList.remove('hidden');
	document.getElementById('power-button').style.backgroundColor = pwrButtonColorOn;
	turnedOn = true;
	document.querySelector('.on-off-icon').style.color = "white";
	ColorWheel.off('color:change', onColorUpdate); // listen to a color picker's color:change event
	WhiteSlider.off('color:change', onWhiteUpdate); // listen to a white slide:change event
}

function connect() {
	console.log('Requesting Bluetooth Device...');
	navigator.bluetooth.requestDevice({
			filters: [{
				services: [0xffe5]
			}]
		})
		.then(device => {
			console.log('> Found ' + device.name);
			console.log('Connecting to GATT Server...');
			return device.gatt.connect();
		})
		.then(server => {
			console.log('Getting Service 0xffe5 - Light control...');
			return server.getPrimaryService(0xffe5);
		})
		.then(service => {
			console.log('Getting Characteristic 0xffe9 - Light control...');
			return service.getCharacteristic(0xffe9);
		})
		.then(characteristic => {

			if (!ledCharacteristic.includes(characteristic)) {
				ledCharacteristic.push(characteristic);
				if (ledCharacteristic.length > 1) document.querySelector('#title').innerHTML += " x" + ledCharacteristic.length;
				console.log('All ready! ' + characteristic.service.device.name + " added");
			}
			onConnected();
		})
		.catch(error => {
			console.log('Argh! ' + error);
		});
}

function turnOn() {
	// console.log('turnOn');
	// document.getElementById('power-button').style.backgroundColor = pwrButtonColorOn;
	// document.querySelector('.on-off-icon').style.color = "white";
	// turnedOn = true;
	let data = new Uint8Array([0xcc, 0x23, 0x33]);
	return ledCharacteristic.forEach(led => led.writeValue(data)
		.catch(err => console.log('Error when turning on! ', err))
		.then(() => {
			turnedOn = true;
			// toggleButtons();
			ColorWheel.on('color:change', onColorUpdate); // listen to a color picker's color:change event
			WhiteSlider.on('color:change', onWhiteUpdate); // listen to a white slide:change event
			document.getElementById('power-button').style.backgroundColor = pwrButtonColorOn;
			document.querySelector('.on-off-icon').style.color = "white";			
		}));

}

function turnOff() {
	// turnedOn = false;
	// document.getElementById('power-button').style.backgroundColor = "#a6a6a6";
	// document.querySelector('.on-off-icon').style.color = "black";
	// console.log('turnOff');
	let data = new Uint8Array([0xcc, 0x24, 0x33]);
	return ledCharacteristic.forEach(led => led.writeValue(data)
		.catch(err => console.log('Error when turning off! ', err))
		.then(() => {
			turnedOn = false;
			// toggleButtons();
			ColorWheel.off('color:change', onColorUpdate); // listen to a color picker's color:change event
			WhiteSlider.off('color:change', onWhiteUpdate); // listen to a white slide:change event
			document.getElementById('power-button').style.backgroundColor = pwrButtonColorOff;
			document.querySelector('.on-off-icon').style.color = "black";
		}));

}

function turnOnOff() {
	if (turnedOn) {
		turnOff();
	} else {
		turnOn();
	}
}

// function toggleButtons() {
// 	// Array.from(document.querySelectorAll('.color-buttons button')).forEach(function (colorButton) {
// 	// 	colorButton.disabled = !turnedOn;
// 	// });
// 	// document.querySelector('.mic-button button').disabled = !turnedOn;
//     turnedOn ? document.querySelector('.wheel').classList.remove('hidden') : document.querySelector('.wheel').classList.add('hidden');
// }


function onColorUpdate(color, changes) {
  // send the color's new value
  setColor(color.rgb.r, color.rgb.g, color.rgb.b);
  // console.log(color.rgbString);
}

function onWhiteUpdate(color, changes) {
  // send the color's new value
  setWhiteColor(color.rgb.r); // rgb changed together, get someone (r)
  //console.log(color.rgbString);
}

function setColor(red, green, blue) {
	let data = new Uint8Array([0x56, red, green, blue, 0x00, 0xf0, 0xaa]);
	return ledCharacteristic.forEach(led => led.writeValue(data)
		.catch(err => console.log('Error when writing value! ', err)));
}

function setWhiteColor(white) {
	let data = new Uint8Array([0x56, 0x00, 0x00, 0x00, white, 0x0f, 0xaa]);
	return ledCharacteristic.forEach(led => led.writeValue(data)
		.catch(err => console.log('Error when writing value! ', err)));
}

// function red() {
// 	return setColor(255, 0, 0)
// 		.then(() => console.log('Color set to Red'));
// }

// function green() {
// 	return setColor(0, 255, 0)
// 		.then(() => console.log('Color set to Green'));
// }

// function blue() {
// 	return setColor(0, 0, 255)
// 		.then(() => console.log('Color set to Blue'));
// }

// function listen() {
// 	annyang.start({
// 		continuous: true
// 	});
// }

// Voice commands
// annyang.addCommands({
// 	'red': red,
// 	'green': green,
// 	'blue': blue,
// 	'turn on': turnOn,
// 	'turn off': turnOff
// });

//Install service worker - for offline support
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('serviceworker.js');
}
