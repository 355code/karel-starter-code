//WELCOME TO KAREL
//do not touch the following code. scroll down>>>

const display = document.getElementById("display")
const grid = document.getElementById("grid");
const boxSizeDisplay = document.getElementById("box-size");
const gridSizeDisplay = document.getElementById("grid-size");
const DIRECTIONS = ["north", "east", "south", "west"]
let KAREL;
const SPEEDS = ['very slow', 'slow', 'regular', 'fast', 'very fast'];
let speed = "regular";
const INTERVALS = [1000, 500, 100, 50, 10];
let counter = 1;
let gridSize = 10;
let boxSize = 45;

//initiate canvas
const canvas = document.getElementById('canvas');
canvas.width = gridSize * boxSize;
canvas.height = gridSize * boxSize;
const ctx = canvas.getContext('2d');

const boxSizeControl = document.getElementById("box-control");

const handleBoxSizeDisplay = (event) => {
    boxSize = event.target.value;
    boxSizeDisplay.innerHTML = `${boxSize}px`;
}

const handleBoxSizeChange = (event) => {
    boxSize = event.target.value;
    createBoard(gridSize, boxSize);
    startGame();
}

boxSizeControl.addEventListener('input', handleBoxSizeDisplay);
boxSizeControl.addEventListener('change', handleBoxSizeChange);

const gridSizeControl = document.getElementById("grid-control");

const handleGridSizeDisplay = (event) => {
    gridSize = event.target.value;
    gridSizeDisplay.innerHTML = `${gridSize}x${gridSize}`;
}

const handleGridSizeChange = (event) => {
    gridSize = event.target.value;
    createBoard(gridSize, boxSize);
    startGame();
}

gridSizeControl.addEventListener('input', handleGridSizeDisplay);
gridSizeControl.addEventListener('change', handleGridSizeChange);



class GridBox extends HTMLElement {
    constructor(id) {
        super()
        this.id = `${id[0]}-${id[1]}`;
        this.classList.add("box")
        this._walls = [];
    }

    addWall(direction) {
        this._walls.push(direction);
    }

    get walls() {
        return this._walls;
    }
}

customElements.define('grid-box', GridBox)

class Ball extends HTMLElement {
    constructor(location, color) {
        super()
        this.classList.add("ball");
        this.style.backgroundColor = color;
        this._location = location;
    }

    put() {
        const coords = `${this._location[0]}-${this._location[1]}`
        let parent = document.getElementById(coords);
        parent.append(this);
    }
}

customElements.define('red-ball', Ball)

class Karel extends HTMLElement {
    constructor() {
        super();
        this.classList.add("karel");
        this._direction = "east";
        this._location = [1, 1];
        this._stuck = false;
    }

    get direction() {
        return this._direction
    }
    place(row, column) {
        if (row > gridSize || column > gridSize) return;

        const startPoint = row && column ? `${row}-${column}` : "1-1";
        this._location = row && column ? [row, column] : [1, 1];
        const startBox = document.getElementById(startPoint);
        startBox.append(this);
    }

    turnRight() {
        counter++
        setTimeout(() => {

            if (this._stuck) return;

            let index = DIRECTIONS.indexOf(this._direction);
            let newDirection = index != 3 ? DIRECTIONS[index + 1] : DIRECTIONS[0];
            this._direction = newDirection;
            index = DIRECTIONS.indexOf(this._direction);
            this.style.transform = `rotate(${(index - 1) * 90}deg)`

        }, [INTERVALS[SPEEDS.indexOf(speed)] * counter])
    }

    turnLeft() {
        counter++
        setTimeout(() => {

            if (this._stuck) return;

            let index = DIRECTIONS.indexOf(this._direction);
            let newDirection = index != 0 ? DIRECTIONS[index - 1] : DIRECTIONS[3];
            this._direction = newDirection;
            index = DIRECTIONS.indexOf(this._direction);
            this.style.transform = `rotate(${(index - 1) * 90}deg)`

        }, [INTERVALS[SPEEDS.indexOf(speed)] * counter])
    }

    moveOne() {
        counter++
        return new Promise((resolve, reject) => {
            setTimeout(() => {

                if (this._stuck) return;

                let currentGridBox = this.parentElement;
                if (currentGridBox._walls.includes(this._direction)) {
                    console.log("uh oh you hit a wall!")
                    this._stuck = true;
                    return
                }
                let newCoords = this._location;
                switch (this._direction) {
                    case "north":
                        newCoords[0] -= 1;
                        break;
                    case "east":
                        newCoords[1] += 1;
                        break;
                    case "south":
                        newCoords[0] += 1;
                        break;
                    case "west":
                        newCoords[1] -= 1;
                        break;
                }
                let destGridBox = document.getElementById(`${newCoords[0]}-${newCoords[1]}`);
                destGridBox.append(this);
                this._location = newCoords;
                resolve(newCoords);

            }, [INTERVALS[SPEEDS.indexOf(speed)] * counter])
        })
    }


    move(boxsToMove) {
        let jump = boxsToMove || 1;
        for (let i = 0; i < jump; i++) {
            this.moveOne()
        }
    }

    putBall(ballColor) {
        counter++
        setTimeout(() => {

            if (this._stuck) return;

            let color = ballColor || "red";

            const ball = new Ball(this._location, color);
            ball.put();

        }, [INTERVALS[SPEEDS.indexOf(speed)] * counter])
    }

    draw() {
        ctx.fillStyle = "black";
        ctx.moveTo((this._location[1] - 0.5)*boxSize, (this._location[0] - 0.5)*boxSize);
        this.moveOne()
            .then((newCoords) => {
                console.log(newCoords);
                ctx.lineTo((newCoords[1] - 0.5) * boxSize, (newCoords[0] - 0.5) * boxSize);
                ctx.stroke()
            });
    }
}

customElements.define('karel-dog', Karel)

const createBoard = (gridSize, boxSize) => {

    while (grid.children.length > 0) {
        grid.children[0].remove()
    }
    display.style.setProperty("--grid-size", gridSize);
    display.style.setProperty("--box-size", boxSize + 'px');
    canvas.width = gridSize * boxSize;
    canvas.height = gridSize * boxSize;
    let boxCount = Math.pow(gridSize, 2)
    let row = 1;
    let column = 1;
    for (let i = 0; i < boxCount; i++) {
        let box = new GridBox([row, column])

        if (row == 1) {
            box.addWall("north");
        }
        if (row == gridSize) {
            box.addWall("south");
        }
        if (column == 1) {
            box.addWall("west");
        }
        if (column == gridSize) {
            box.addWall("east")
        }

        grid.append(box)

        column++
        if (column > gridSize) {
            column = 1;
            row++
        }
    }
}


const startGame = (startRow, startColumn) => {
    KAREL = new Karel();
    KAREL.place(startRow, startColumn);
}

createBoard(10, 45)
startGame()

/*commands:

KAREL.turnLeft()
KAREL.turnRight()
KAREL.move()
KAREL.place(row: Number, column: Number)
KAREL.directon
*/

/*
uncomment the following line to change speed
options - 'very slow', 'slow', 'regular', 'fast', 'very fast';
*/

//speed = 'very fast'

// write your code after this line:





//

//code editor UI
const code = document.getElementById("code");
const runButton = document.getElementById("run");
const lineDisplay = document.getElementById("line-display")
const lineDisplayWrapper = document.getElementById("line-display-wrapper")

const executeCode = (code) => {
    counter = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    KAREL.remove()
    startGame()
    const script = document.createElement("script");
    script.innerHTML = code.value;
    document.body.append(script);
}

runButton.addEventListener('click', () => executeCode(code));

// let lineNumber = 1;
// let lineText = '1 ';

// const handleNewLine = (event) => {
//     const allLines = document.querySelectorAll(".line-display");
//     let lastLine =  allLines[allLines.length - 1]
//     let lastLineText = lastLine.children[0];

//     if(event.key == 'Shift') return;

//     if (event.key == 'Enter') {
//         lineNumber++;
//         lineText = lineNumber + " ";
//         const newLine = lineDisplay.cloneNode(true);
//         newLine.children[0].innerHTML = lineText;
//         lineDisplayWrapper.append(newLine);
//     }

//     else if (event.key == 'Backspace') {
//         if (lineText.length == 2 && lineText != "1 ") {
//             lastLine.remove();
//             lineNumber--
//             lineText = allLines[allLines.length - 2].children[0].innerHTML
//         }
//         else if (lineText != "1 ") {
//             console.log(lineText)
//             lineText = lineText.slice(0, -1);
//             lastLineText.innerHTML = lineText;
//         }
//     }

//     else {
//         lineText += event.key;
//         lastLineText.innerHTML = lineText;
//     }


// }
// code.addEventListener('keydown', handleNewLine);









