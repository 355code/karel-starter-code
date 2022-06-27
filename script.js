//WELCOME TO KAREL
//do not touch the following code. scroll down>>>

const grid = document.getElementById("grid");
const DIRECTIONS = ["north", "east", "south", "west"]
let KAREL;
let SPEEDS = ['very slow', 'slow', 'regular', 'fast', 'very fast'];
let speed = "regular";
let INTERVALS = [1000, 500, 100, 50, 10];
let counter = 1;

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
    constructor(location) {
        super()
        this.classList.add("ball");
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

    move() {
        counter++
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
                    newCoords[0] -= 1
                    break;
                case "east":
                    newCoords[1] += 1
                    break;
                case "south":
                    newCoords[0] += 1
                    break;
                case "west":
                    newCoords[1] -= 1
                    break;
            }
            let destGridBox = document.getElementById(`${newCoords[0]}-${newCoords[1]}`);
            destGridBox.append(this);
            this._location = newCoords;

        }, [INTERVALS[SPEEDS.indexOf(speed)] * counter])
    }

    putBall() {
        counter++
        setTimeout(() => {

            if (this._stuck) return;

            const ball = new Ball(this._location);
            ball.put();

        }, [INTERVALS[SPEEDS.indexOf(speed)] * counter])
    }


}

customElements.define('karel-dog', Karel)

const createBoard = (gridSize, boxSize) => {
    grid.style.setProperty("--grid-size", gridSize)
    grid.style.setProperty("--box-size", boxSize + 'px')
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

createBoard(10, 30)
startGame()

console.log(`
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
`)








