const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");


const ROWS = 20;
const COLUMNS = 10;
const SQUARE_SIZE = 40;

let board = []; // tablica przechowywująca aktualną mapę gry

const typeOfTetromino = [
    L, O, I, S,
    T, Z, J
];

let gameOver = false;
let score = 0;
let speed = 500;
let myTetromino = randomTetromino();

//Rysowanie kwadratu
function drawSquare(x, y, color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQUARE_SIZE,y*SQUARE_SIZE,SQUARE_SIZE,SQUARE_SIZE);

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x*SQUARE_SIZE,y*SQUARE_SIZE,SQUARE_SIZE,SQUARE_SIZE);
}



// Wypełnianie planszy kwadratami o wartości domyślnej
function createBoard() {
    for (let i = 0; i < ROWS; i++) {
        board[i] = [];
        for (let j = 0; j < COLUMNS; j++) {
                board[i][j] = "WHITE";
        }
    }
}


//Rysowanie tablicy na planszy
function drawBoard(){
    for	(let i=0; i < ROWS; i++){
        for (let j=0; j < COLUMNS; j++) {
            drawSquare(j, i, board[i][j]);
        }
    }
}

function Tetromino (tetromino, color){
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoRotateIndex = 0;
    this.activeTetromino = this.tetromino[this.tetrominoRotateIndex];

    this.x = 3;
    this.y = -2;
}

//losowy kolor
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//Losowanie tetromino
function randomTetromino(){
    let randomTrominoType = Math.floor(Math.random() * typeOfTetromino.length);
    return new Tetromino(typeOfTetromino[randomTrominoType], getRandomColor());
}

//Rysowanie tetromino na planszy
Tetromino.prototype.draw = function(){
    for (let i = 0; i <this.activeTetromino.length ; i++) {
        for (let j = 0; j < this.activeTetromino[0].length ; j++) {
            if (this.activeTetromino[i][j])
                drawSquare(this.x + j, this.y + i, this.color);
        }
    }
}

//Usuwanie tetromino z planszy
Tetromino.prototype.unDraw = function(){
    for (let i = 0; i <this.activeTetromino.length ; i++) {
        for (let j = 0; j < this.activeTetromino[0].length ; j++) {
            if (this.activeTetromino[i][j])
                drawSquare(this.x + j, this.y + i, "WHITE");
        }
    }
}

//Przesuwanie w dół
Tetromino.prototype.moveDown = function() {
    if(!this.collision(0,1,this.activeTetromino)){
            this.unDraw();
            this.y++;
            this.draw();
        }
    else {
        this.lock();
        myTetromino = randomTetromino();
    }
}

//Przesuwanie w prawo
Tetromino.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
            this.unDraw();
            this.x++;
            this.draw()
        }
}

//Przesuwanie w lewo
Tetromino.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw()
    }
}


//Obrót tetromino
Tetromino.prototype.rotate = function() {
    let nextTetrominoRotateIndex = (this.tetrominoRotateIndex + 1) % this.tetromino.length;
    let nextTetrominoPattern = this.tetromino[nextTetrominoRotateIndex];
    let kick = 0; //ewentualne przesunięcie gdy jesteśmy przy krawędzi

    if(this.collision(0,0,nextTetrominoPattern)){
        if(this.x > COLUMNS/2){
            // prawa ściana
            kick = -1; // przesunięcie w lewo tetromino
        }else{
            // lewa ściana
            kick = 1; // przesunięcie tetromino w prawo
        }
    }

    if(!this.collision(kick,0,nextTetrominoPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoRotateIndex = nextTetrominoRotateIndex;
        this.activeTetromino = nextTetrominoPattern;
        this.draw();
    }
}


//Funkcja opuszczająca Tetromino co interwał czasu
let dropStart = Date.now();
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > speed){
        myTetromino.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
    else
    {
        alert("Koniec gry :(\nTwój wynik = "+score)?"":location.reload();
    }
}

//Kontrola kolizji
Tetromino.prototype.collision = function(x,y,tetromino){
    for( let r = 0; r < tetromino.length; r++){
        for(let c = 0; c < tetromino[0].length; c++){
            // Opuszczanie białych pól w tablicy naszego tetromino
            if(!tetromino[r][c]){
                continue;
            }
            // nowe wspołrzędne tetromino po ruchu
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // krawędzie
            if(newX < 0 || newX >= COLUMNS || newY >= ROWS){
                return true;
            }
            // opusczanie wartości ujemnych dla Y (nasze tetromino startuje z góry zawsze od -2)
            if(newY < 0){
                continue;
            }
            // sprawdzenie czy na następnym miejscu znajduje się już klocek
            if( board[newY][newX] != "WHITE"){
                return true;
            }
        }
    }
    return false;
}

//blokowanie tetromino na mapie, dodawanie wartości do tablicy i zbijanie pełnych wierszy
Tetromino.prototype.lock = function(){
    for( let i = 0; i< this.activeTetromino.length; i++){
        for(let j = 0; j < this.activeTetromino[0].length; j++){
            // pomijanie pustych wartości
            if( !this.activeTetromino[i][j]){
                continue;
            }
            // przepełniona mapa
            if(this.y + i < 0){
                    gameOver = true;
                    break;
            }
            // blokowanie tetromino na mpaie, dodawanie wartości do tablicy
            board[this.y+i][this.x+j] = this.color;
        }
    }

    // usuwanie pełnych wierszy
    for(let r = 0; r < ROWS; r++){
        let isRowFull = true;
        for(let c = 0; c < COLUMNS; c++){
            isRowFull = isRowFull && (board[r][c] != "WHITE");
        }
        if(isRowFull){
            // jeśli wiersz jest pełny
            // przesuwamy wszystkie wiersze, które były ponad nim niżej
            for(let y = r; y > 1; y--){
                for( let c = 0; c < COLUMNS; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // dla wiersza najwyżej wypełniamy go wartością domyślną
            for(let c = 0; c < COLUMNS; c++){
                board[0][c] = "WHITE";
            }
            score += 10;
            if (speed>=55)
                speed-=5;

            scoreElement.innerHTML = score;
        }
    }
    drawBoard();
}


// Kontrolowanie tetromino za pomocą klawiszy
function controlTetromino( event) {
    switch (event.keyCode) {
        case 37:
            myTetromino.moveLeft();
            break;
        case 38:
            myTetromino.rotate();
            break;
        case 39:
            myTetromino.moveRight();
            break;
        case 40:
            myTetromino.moveDown();
            break;
    }
}


document.addEventListener('keydown', controlTetromino);
createBoard();
drawBoard();
drop();

