//WELCOME TO KAREL
//do not touch the following code. scroll down>>>

const display = document.getElementById("display")
const grid = document.getElementById("grid");
const boxSizeDisplay = document.getElementById("box-size");
const gridSizeDisplay = document.getElementById("grid-size");
const run = document.getElementById("run")
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
        counter++
        setTimeout(() => {
            console.log(this._direction)
        }, [INTERVALS[SPEEDS.indexOf(speed)] * counter])
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

    draw(color) {
        // counter++
        setTimeout(() => {
            ctx.beginPath();
            ctx.moveTo((this._location[1] - 0.5) * boxSize, (this._location[0] - 0.5) * boxSize);
        }, [INTERVALS[SPEEDS.indexOf(speed)] * counter])
        this.moveOne()
            .then((newCoords) => {
                ctx.strokeStyle = color || "black";
                ctx.lineTo((newCoords[1] - 0.5) * boxSize, (newCoords[0] - 0.5) * boxSize);
                ctx.closePath();
                ctx.stroke()
            });

    }

    isFrontClear() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const loc = this._location;
                const currentGridBox = document.getElementById(`${loc[0]}-${loc[1]}`);
                if (currentGridBox.walls.includes(this._direction)) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            }, [INTERVALS[SPEEDS.indexOf(speed)] * counter])
        })

    }

    isFacing(direction) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._direction == direction) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }, [INTERVALS[SPEEDS.indexOf(speed)] * counter])
        })
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

run.addEventListener('click', runCode)

const startGame = (startRow, startColumn) => {
    KAREL = new Karel();
    KAREL.place(startRow, startColumn);
}

createBoard(gridSize, boxSize)
startGame()

//don't touch the code above this line

/*commands:

KAREL.move()
KAREL.turnLeft()
KAREL.turnRight()
KAREL.putBall(color: String)
KAREL.place(row: Number, column: Number)
KAREL.directon
KAREL.draw(color: String)

KAREL.isFrontClear().then((isClear)=>{
    if(isClear){
    //code to execute if front is clear
    }
    else{
    //code to execute if front is not clear
    }
})

**OR**

isClear = await KAREL.isFrontClear()

KAREL.isFacing(direction: String).then((isFacing)=>{
    if(isFacing){
    //code to execute if Karel is facing direction
    }
    else{
    //code to execute if Karel is not facing direction
    }
    
**OR**

isFacing = await KAREL.isFacing(direction: String)
*/

//uncomment the following line to change speed
//speed = 'very slow'

//options - 'very slow', 'slow', 'regular', 'fast', 'very fast';

async function runCode(){
KAREL.remove()
startGame()

// write your code after this line:







//do not add code below this line
}


