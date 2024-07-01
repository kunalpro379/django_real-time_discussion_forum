document.addEventListener('DOMContentLoaded', function () {
    // Function to handle resizable elements
    const makeResizable = function (resizer) {
        const direction = resizer.getAttribute('data-direction') || 'horizontal';
        const prevElement = resizer.previousElementSibling;
        const nextElement = resizer.nextElementSibling;

        let startX = 0;
        let startY = 0;
        let prevElementWidth = 0;
        let prevElementHeight = 0;

        const mouseDownHandler = function (e) {
            startX = e.clientX;
            startY = e.clientY;
            const rect = prevElement.getBoundingClientRect();
            prevElementWidth = rect.width;
            prevElementHeight = rect.height;

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler = function (e) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            switch (direction) {
                case 'vertical':
                    const newHeight = ((prevElementHeight + dy) * 100) / resizer.parentNode.getBoundingClientRect().height;
                    prevElement.style.height = newHeight + '%';
                    break;
                case 'horizontal':
                default:
                    const newWidth = ((prevElementWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
                    prevElement.style.width = newWidth + '%';
                    break;
            }
        };

        const mouseUpHandler = function () {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        resizer.addEventListener('mousedown', mouseDownHandler);
    };

    // Query all resizers and make them resizable
    document.querySelectorAll('.resizer').forEach(function (resizer) {
        makeResizable(resizer);
    });
/*

    document.querySelector('#zoomIn').addEventListener('click', zoomIn);
    document.querySelector('#zoomOut').addEventListener('click', zoomOut);
    // Canvas Drawing Code
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let prevMouseX, prevMouseY, snapshot;
    let selectedTool = 'brush';
    let brushWidth = 5;
    let selectedColor = '#fff';
    let isPanning = false;
    let isHandToolActive = false;
    let isArrowToolActive = false;
    const zoomIn = () => {
        scale *= 1.1;
        canvas.style.transform = `scale(${scale})`;
    };

    const zoomOut = () => {
        scale /= 1.1;
        canvas.style.transform = `scale(${scale})`;
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', drawing);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);
    canvas.addEventListener('mousemove', mouseMoveHandler);

    // Tool Button Click Handlers
    document.querySelector('#pan').addEventListener('click', () => {
        isPanning = true;
        isHandToolActive = false;
        isArrowToolActive = false;
        document.querySelector('.tool-button.selected').classList.remove('selected');
        document.querySelector('#pan').classList.add('selected');
        canvas.style.cursor = 'move';
    });

    document.querySelector('#hand').addEventListener('click', () => {
        isHandToolActive = true;
        isPanning = false;
        isArrowToolActive = false;
        document.querySelector('.tool-button.selected').classList.remove('selected');
        document.querySelector('#hand').classList.add('selected');
        canvas.style.cursor = 'grab';
    });

    document.querySelector('#arrow').addEventListener('click', () => {
        isArrowToolActive = true;
        isPanning = false;
        isHandToolActive = false;
        document.querySelector('.tool-button.selected').classList.remove('selected');
        document.querySelector('#arrow').classList.add('selected');
        canvas.style.cursor = 'crosshair';
    });
    const setCanvasBackground = () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = selectedColor;
    };

    window.addEventListener('load', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setCanvasBackground();
    });

    const drawRect = (e) => {
        if (!fillColor.checked) {
            return ctx.strokeRect(prevMouseX, prevMouseY, e.offsetX - prevMouseX, e.offsetY - prevMouseY);
        }
        ctx.fillRect(prevMouseX, prevMouseY, e.offsetX - prevMouseX, e.offsetY - prevMouseY);
    };

    const drawCircle = (e) => {
        ctx.beginPath();
        let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
        ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
        fillColor.checked ? ctx.fill() : ctx.stroke();
    };

    const drawTriangle = (e) => {
        ctx.beginPath();
        ctx.moveTo(prevMouseX, prevMouseY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
        ctx.closePath();
        fillColor.checked ? ctx.fill() : ctx.stroke();
    };

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
        ctx.strokeStyle = selectedColor;
        ctx.fillStyle = selectedColor;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

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
            ctx.strokeStyle = selectedTool === 'eraser' ? '#000' : selectedColor;
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

    // Menu Interaction Code
    const toolBtns = document.querySelectorAll('.tool');
    const sizeSlider = document.querySelector('#sizeSlider');
    const fillColor = document.querySelector('#fillColor');
    const colorsBtns = document.querySelectorAll('.color-option');
    const colorPicker = document.querySelector('#colorPicker');
    const clearCanvasBtn = document.querySelector('.clear-canvas');
    const saveImgBtn = document.querySelector('.save-img');

    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.tool.selected').classList.remove('selected');
            btn.classList.add('selected');
            selectedTool = btn.id;
        });
    });

    sizeSlider.addEventListener('input', () => {
        brushWidth = sizeSlider.value;
    });

    colorsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.color-option.selected').classList.remove('selected');
            btn.classList.add('selected');
            selectedColor = btn.style.backgroundColor;
        });
    });

    colorPicker.addEventListener('input', () => {
        selectedColor = colorPicker.value;
        colorPicker.parentElement.style.backgroundColor = selectedColor;
    });

    clearCanvasBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCanvasBackground();
    });

    colorPicker.addEventListener('change', () => {
        colorPicker.parentElement.style.backgroundColor = colorPicker.value;
        colorPicker.parentElement.click();
    });

    clearCanvasBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCanvasBackground();
    });

    saveImgBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `sketch_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
*/

});
