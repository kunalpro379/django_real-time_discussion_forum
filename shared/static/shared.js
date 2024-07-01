
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let prevMouseX, prevMouseY, snapshot;
    let selectedTool = 'brush';
    let brushWidth = 5;
    let selectedColor = '#4e4e4e';
    let scale = 1;



    document.addEventListener('click', (event) => {
        if (!menuCard.contains(event.target) && event.target !== menuButton) {
            menuCard.style.display = 'none';
        }
    });

    const toolOptions = document.querySelectorAll('.tool');
    toolOptions.forEach(option => {
        option.addEventListener('click', () => {
            toolOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedTool = option.id; // Assuming each tool has an id matching the tool name
        });
    });

    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedColor = option.dataset.color; // Assuming each color option has a data attribute `data-color` with the color value
            ctx.strokeStyle = selectedColor;
            ctx.fillStyle = selectedColor;
        });
    });

    // Function to set canvas dimensions and initial background
    const setCanvasBackground = () => {
        ctx.fillStyle = '#262626'; // Background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = selectedColor;
    };

    // Set canvas dimensions on window load
    window.addEventListener('load', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setCanvasBackground();
    });

    // Function to handle mouse down event for drawing
    const startDraw = (e) => {
        if (selectedTool === 'pan') {
            canvas.style.cursor = 'grabbing';
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
            isDrawing = true;
            return;
        }

        isDrawing = true;
        prevMouseX = e.offsetX;
        prevMouseY = e.offsetY;
        ctx.beginPath();
        ctx.lineWidth = brushWidth;
        ctx.lineCap = 'round'; // Rounded brush stroke
        ctx.strokeStyle = selectedColor;
        ctx.fillStyle = selectedColor;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    // Function to handle drawing based on selected tool
    const drawing = (e) => {
        if (!isDrawing) return;

        if (selectedTool === 'pan') {
            canvas.style.cursor = 'grabbing';
            const dx = e.clientX - prevMouseX;
            const dy = e.clientY - prevMouseY;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(snapshot, dx, dy);
            return;
        }

        ctx.putImageData(snapshot, 0, 0);

        if (selectedTool === 'brush' || selectedTool === 'eraser') {
            ctx.strokeStyle = selectedTool === 'eraser' ? '#262626' : selectedColor;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        } else if (selectedTool === 'rectangle') {
            drawRect(e);
        } else if (selectedTool === 'circle') {
            drawCircle(e);
        } else if (selectedTool === 'triangle') {
            drawTriangle(e);
        }
    };

    // Drawing functions for different shapes
    const drawRect = (e) => {
        const startX = Math.min(prevMouseX, e.offsetX);
        const startY = Math.min(prevMouseY, e.offsetY);
        const width = Math.abs(prevMouseX - e.offsetX);
        const height = Math.abs(prevMouseY - e.offsetY);
        ctx.beginPath();
        if (!fillColor.checked) {
            ctx.strokeRect(startX, startY, width, height);
        } else {
            ctx.fillRect(startX, startY, width, height);
        }
    };

    const drawCircle = (e) => {
        const radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
        ctx.beginPath();
        ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
        if (!fillColor.checked) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    };

    const drawTriangle = (e) => {
        ctx.beginPath();
        ctx.moveTo(prevMouseX, prevMouseY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
        ctx.closePath();
        if (!fillColor.checked) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    };

    // Event listeners for drawing on canvas
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', drawing);
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        canvas.style.cursor = 'default';
    });
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        canvas.style.cursor = 'default';
    });

    // Tool Button Click Handlers (Assuming IDs match tool names)
    document.getElementById('pan').addEventListener('click', () => {
        selectedTool = 'pan';
        canvas.style.cursor = 'grab';
    });

    document.getElementById('brush').addEventListener('click', () => {
        selectedTool = 'brush';
        canvas.style.cursor = 'crosshair';
    });

    document.getElementById('eraser').addEventListener('click', () => {
        selectedTool = 'eraser';
        canvas.style.cursor = 'crosshair';
    });

    document.getElementById('rectangle').addEventListener('click', () => {
        selectedTool = 'rectangle';
        canvas.style.cursor = 'crosshair';
    });

    document.getElementById('circle').addEventListener('click', () => {
        selectedTool = 'circle';
        canvas.style.cursor = 'crosshair';
    });

    document.getElementById('triangle').addEventListener('click', () => {
        selectedTool = 'triangle';
        canvas.style.cursor = 'crosshair';
    });

    // Menu Interaction Code (Size slider, color picker, etc.)
    const sizeSlider = document.getElementById('sizeSlider');
    sizeSlider.addEventListener('input', () => {
        brushWidth = sizeSlider.value;
    });

    const fillColor = document.getElementById('fillColor');
    fillColor.addEventListener('change', () => {
        if (fillColor.checked) {
            fillColor.parentElement.style.backgroundColor = '#fff';
        } else {
            fillColor.parentElement.style.backgroundColor = '#262626';
        }
    });

    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', () => {
        selectedColor = colorPicker.value;
        ctx.strokeStyle = selectedColor;
        ctx.fillStyle = selectedColor;
    });

    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    clearCanvasBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCanvasBackground();
    });

    const saveImgBtn = document.querySelector('.save-img');
    saveImgBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `drawing_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });

    const zoomIn = () => {
        scale *= 1.1;
        canvas.style.transform = `scale(${scale})`;
    };

    const zoomOut = () => {
        scale /= 1.1;
        canvas.style.transform = `scale(${scale})`;
    };

    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);

});




// document.addEventListener('DOMContentLoaded', () => {
//     const canvas = document.getElementById('drawingCanvas');
//     const ctx = canvas.getContext('2d');

//     // Function to set canvas background and initial setup
//     const setCanvasBackground = () => {
//         ctx.fillStyle = "#fff";
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
//     };

//     // Initial canvas setup
//     window.addEventListener("load", () => {
//         canvas.width = canvas.offsetWidth;
//         canvas.height = canvas.offsetHeight;
//         setCanvasBackground();
//     });

//     // Drawing variables and functions
//     let prevMouseX, prevMouseY, snapshot, isDrawing = false,
//         selectedTool = "brush",
//         brushWidth = 8,
//         selectedColor = "#000";

//     const drawRect = (e) => {
//         if (!fillColor.checked) {
//             return ctx.strokeRect(prevMouseX, prevMouseY, e.offsetX - prevMouseX, e.offsetY - prevMouseY);
//         }
//         ctx.fillRect(prevMouseX, prevMouseY, e.offsetX - prevMouseX, e.offsetY - prevMouseY);
//     };

//     const drawCircle = (e) => {
//         ctx.beginPath();
//         let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
//         ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
//         fillColor.checked ? ctx.fill() : ctx.stroke();
//     };

//     const drawTriangle = (e) => {
//         ctx.beginPath();
//         ctx.moveTo(prevMouseX, prevMouseY);
//         ctx.lineTo(e.offsetX, e.offsetY);
//         ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
//         ctx.closePath();
//         fillColor.checked ? ctx.fill() : ctx.stroke();
//     };

//     const startDraw = (e) => {
//         isDrawing = true;
//         prevMouseX = e.offsetX;
//         prevMouseY = e.offsetY;
//         ctx.beginPath();
//         ctx.lineWidth = brushWidth;
//         ctx.strokeStyle = selectedColor;
//         ctx.fillStyle = selectedColor;
//         snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     };

//     const drawing = (e) => {
//         if (!isDrawing) return;
//         ctx.putImageData(snapshot, 0, 0);

//         if (selectedTool === "brush" || selectedTool === "eraser") {
//             ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
//             ctx.lineTo(e.offsetX, e.offsetY);
//             ctx.stroke();
//         } else if (selectedTool === "rectangle") {
//             drawRect(e);
//         } else if (selectedTool === "circle") {
//             drawCircle(e);
//         } else if (selectedTool === "triangle") {
//             drawTriangle(e);
//         }
//     };

//     // Event listeners for canvas drawing
//     canvas.addEventListener('mousedown', startDraw);
//     canvas.addEventListener('mousemove', drawing);
//     canvas.addEventListener('mouseup', () => isDrawing = false);
//     canvas.addEventListener('mouseleave', () => isDrawing = false);

//     // Tool selection buttons
//     const toolBtns = document.querySelectorAll('.tool-button');
//     toolBtns.forEach(btn => {
//         btn.addEventListener('click', () => {
//             toolBtns.forEach(opt => opt.classList.remove('selected'));
//             btn.classList.add('selected');
//             selectedTool = btn.id;
//         });
//     });

//     // Size adjustment slider
//     const sizeSlider = document.getElementById('size-slider');
//     sizeSlider.addEventListener('input', () => brushWidth = sizeSlider.value);

//     // Color selection buttons
//     const colorsBtns = document.querySelectorAll('.color-option');
//     colorsBtns.forEach(btn => {
//         btn.addEventListener('click', () => {
//             colorsBtns.forEach(opt => opt.classList.remove('selected'));
//             btn.classList.add('selected');
//             selectedColor = window.getComputedStyle(btn).getPropertyValue('background-color');
//         });
//     });

//     // Clear canvas button
//     const clearCanvasBtn = document.querySelector('.clear-canvas');
//     clearCanvasBtn.addEventListener('click', () => {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         setCanvasBackground();
//     });

//     // Save as image button
//     const saveImgBtn = document.querySelector('.save-img');
//     saveImgBtn.addEventListener('click', () => {
//         const link = document.createElement('a');
//         link.download = `drawing_${Date.now()}.png`;
//         link.href = canvas.toDataURL();
//         link.click();
//     });

//     // Resizable divs functionality
//     const resizable = function (resizer) {
//         const direction = resizer.getAttribute('data-direction') || 'horizontal';
//         const prevSibling = resizer.previousElementSibling;
//         const nextSibling = resizer.nextElementSibling;

//         let x = 0;
//         let y = 0;
//         let prevSiblingHeight = 0;
//         let prevSiblingWidth = 0;

//         // Handle the mousedown event
//         // that's triggered when user drags the resizer
//         const mouseDownHandler = function (e) {
//             // Get the current mouse position
//             x = e.clientX;
//             y = e.clientY;
//             const rect = prevSibling.getBoundingClientRect();
//             prevSiblingHeight = rect.height;
//             prevSiblingWidth = rect.width;

//             // Attach the listeners to document
//             document.addEventListener('mousemove', mouseMoveHandler);
//             document.addEventListener('mouseup', mouseUpHandler);
//         };

//         const mouseMoveHandler = function (e) {
//             const dx = e.clientX - x;
//             const dy = e.clientY - y;

//             switch (direction) {
//                 case 'vertical':
//                     const h =
//                         ((prevSiblingHeight + dy) * 100) /
//                         resizer.parentNode.getBoundingClientRect().height;
//                     prevSibling.style.height = h + '%';
//                     break;
//                 case 'horizontal':
//                 default:
//                     const w =
//                         ((prevSiblingWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
//                     prevSibling.style.width = w + '%';
//                     break;
//             }

//             const cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
//             resizer.style.cursor = cursor;
//             document.body.style.cursor = cursor;

//             prevSibling.style.userSelect = 'none';
//             prevSibling.style.pointerEvents = 'none';

//             nextSibling.style.userSelect = 'none';
//             nextSibling.style.pointerEvents = 'none';
//         };

//         const mouseUpHandler = function () {
//             resizer.style.removeProperty('cursor');
//             document.body.style.removeProperty('cursor');

//             prevSibling.style.removeProperty('user-select');
//             prevSibling.style.removeProperty('pointer-events');

//             nextSibling.style.removeProperty('user-select');
//             nextSibling.style.removeProperty('pointer-events');

//             // Remove the handlers of mousemove and mouseup
//             document.removeEventListener('mousemove', mouseMoveHandler);
//             document.removeEventListener('mouseup', mouseUpHandler);
//         };

//         // Attach the handler
//         resizer.addEventListener('mousedown', mouseDownHandler);
//     };

//     // Query all resizers and make them resizable
//     document.querySelectorAll('.resizer').forEach(function (ele) {
//         resizable(ele);
//     });

//     // Menu button functionality (example)
//     const menuButton = document.getElementById('menuButton');
//     const menuCard = document.getElementById('menuCard');

//     menuButton.addEventListener('click', () => {
//         menuCard.style.display = menuCard.style.display === 'none' ? 'block' : 'none';
//     });

//     document.addEventListener('click', (event) => {
//         if (!menuCard.contains(event.target) && event.target !== menuButton) {
//             menuCard.style.display = 'none';
//         }
//     });
// });
