// Mes variables
let legalBoxes = [];
let isWhiteTurn = true;
const boardBoxes = document.getElementsByClassName("box");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");

//****************Drag and drop******************** */
setupBoardBoxes();
setupPieces();
function setupBoardBoxes() {
  for (let i = 0; i < boardBoxes.length; i++) {
    boardBoxes[i].addEventListener("dragover", allowDrop);
    boardBoxes[i].addEventListener("drop", drop);
    let row = 8 - Math.floor(i / 8);
    let column = String.fromCharCode(97 + (i % 8));
    let box = boardBoxes[i];
    box.id = column + row;
  }
}

function setupPieces() {
  for (let i = 0; i < pieces.length; i++) {
    pieces[i].addEventListener("dragstart", drag);
    pieces[i].setAttribute("draggable", true);
    pieces[i].id =
      pieces[i].className.split(" ")[1] + pieces[i].parentElement.id;
  }
  for (let i = 0; i < piecesImages.length; i++) {
    piecesImages[i].setAttribute("draggable", false);
  }
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  const piece = ev.target;
  const pieceColor = piece.getAttribute("color");
  if (
    (isWhiteTurn && pieceColor == "white") ||
    (!isWhiteTurn && pieceColor == "black")
  ) {
    ev.dataTransfer.setData("text", piece.id);
    const startingBoxId = piece.parentNode.id;
    getPossibleMoves(startingBoxId, piece);
  } // tour des joueurs
}

function drop(ev) {
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  const piece = document.getElementById(data);
  const destinationBox = ev.currentTarget;
  let destinationBoxId = destinationBox.id;

  //************Capture************** */
  if (
    isBoxOccupied(destinationBox) == "blank" &&
    legalBoxes.includes(destinationBoxId)
  ) {
    destinationBox.appendChild(piece);
    isWhiteTurn = !isWhiteTurn; // tour des joueurs
    legalBoxes.length = 0;
    return;
  }
  if (
    isBoxOccupied(destinationBox) != "blank" &&
    legalBoxes.includes(destinationBoxId)
  ) {
    while (destinationBox.firstChild) {
      destinationBox.removeChild(destinationBox.firstChild);
    }
    destinationBox.appendChild(piece);
    isWhiteTurn = !isWhiteTurn; // tour des joueurs
    legalBoxes.length = 0;
    return;
  }
}

function getPossibleMoves(startingBoxId, piece) {
  const pieceColor = piece.getAttribute("color");
  if (piece.classList.contains("pawn")) {
    getPawnMoves(startingBoxId, pieceColor);
  }
  if (piece.classList.contains("knight")) {
    getKnightMoves(startingBoxId, pieceColor);
  }
  if (piece.classList.contains("rook")) {
    getRookMoves(startingBoxId, pieceColor);
  }
  if (piece.classList.contains("bishop")) {
    getBishopMoves(startingBoxId, pieceColor);
  }
  if (piece.classList.contains("queen")) {
    getQueenMoves(startingBoxId, pieceColor);
  }
  if (piece.classList.contains("king")) {
    getKingMoves(startingBoxId, pieceColor);
  }
}

function isBoxOccupied(box) {
  if (box.querySelector(".piece")) {
    const color = box.querySelector(".piece").getAttribute("color");
    return color;
  } else {
    return "blank";
  }
}

//*****************fonction de chaque piece****************** */

function getPawnMoves(startingBoxId, pieceColor) {
  checkPawnDiagonalCaptures(startingBoxId, pieceColor);
  checkPawnForwardMoves(startingBoxId, pieceColor);
}

function checkPawnDiagonalCaptures(startingBoxId, pieceColor) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let currentBoxId = currentFile + currentRank;
  let currentBox = document.getElementById(currentBoxId);
  let boxContent = isBoxOccupied(currentBox);
  const direction = pieceColor == "white" ? 1 : -1;

  currentRank += direction;
  for (let i = -1; i <= 1; i += 2) {
    currentFile = String.fromCharCode(file.charCodeAt(0) + i);
    if (currentFile >= "a" && currentFile <= "h") {
      currentBoxId = currentFile + currentRank;
      currentBox = document.getElementById(currentBoxId);
      boxContent = isBoxOccupied(currentBox);
      if (boxContent != "blank" && boxContent != pieceColor)
        legalBoxes.push(currentBoxId);
    }
  }
}
function checkPawnForwardMoves(startingBoxId, pieceColor) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let currentBoxId = currentFile + currentRank;
  let currentBox = document.getElementById(currentBoxId);
  let boxContent = isBoxOccupied(currentBox);
  const direction = pieceColor == "white" ? 1 : -1;
  currentRank += direction;

  currentBoxId = currentFile + currentRank;
  currentBox = document.getElementById(currentBoxId);
  boxContent = isBoxOccupied(currentBox);
  if (boxContent != "blank") return;
  legalBoxes.push(currentBoxId);
  if (rankNumber != 2 && rankNumber != 7) return;

  currentRank += direction;
  currentBoxId = currentFile + currentRank;
  currentBox = document.getElementById(currentBoxId);
  boxContent = isBoxOccupied(currentBox);
  if (boxContent != "blank") return;
  legalBoxes.push(currentBoxId);
}

function getKnightMoves(startingBoxId, pieceColor) {
  const file = startingBoxId.charCodeAt(0) - 97;
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;

  const moves = [
    [-2, 1],
    [-1, 2],
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
  ];
  moves.forEach((move) => {
    currentFile = file + move[0];
    currentRank = rankNumber + move[1];
    if (
      currentFile >= 0 &&
      currentFile <= 7 &&
      currentRank > 0 &&
      currentRank <= 8
    ) {
      let currentBoxId = String.fromCharCode(currentFile + 97) + currentRank;
      let currentBox = document.getElementById(currentBoxId);
      let boxContent = isBoxOccupied(currentBox);
      if (boxContent != "blank" && boxContent == pieceColor) return;
      legalBoxes.push(String.fromCharCode(currentFile + 97) + currentRank);
    }
  });
}

function getRookMoves(startingBoxId, pieceColor) {
  moveToEighthRank(startingBoxId, pieceColor);
  moveToFirstRank(startingBoxId, pieceColor);
  moveToAFile(startingBoxId, pieceColor);
  moveToHFile(startingBoxId, pieceColor);
}

function getBishopMoves(startingBoxId, pieceColor) {
  moveToEighthRankHFile(startingBoxId, pieceColor);
  moveToEighthRankAFile(startingBoxId, pieceColor);
  moveToFirstRankHFile(startingBoxId, pieceColor);
  moveToFirstRankAFile(startingBoxId, pieceColor);
}

function getQueenMoves(startingBoxId, pieceColor) {
  moveToEighthRankHFile(startingBoxId, pieceColor);
  moveToEighthRankAFile(startingBoxId, pieceColor);
  moveToFirstRankHFile(startingBoxId, pieceColor);
  moveToFirstRankAFile(startingBoxId, pieceColor);
  moveToEighthRank(startingBoxId, pieceColor);
  moveToFirstRank(startingBoxId, pieceColor);
  moveToAFile(startingBoxId, pieceColor);
  moveToHFile(startingBoxId, pieceColor);
}

function getKingMoves(startingBoxId, pieceColor) {
  const file = startingBoxId.charCodeAt(0) - 97;
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;

  const moves = [
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 0],
    [-1, -1],
    [-1, 1],
    [1, 0],
  ];
  moves.forEach((move) => {
    currentFile = file + move[0];
    currentRank = rankNumber + move[1];
    if (
      currentFile >= 0 &&
      currentFile <= 7 &&
      currentRank > 0 &&
      currentRank <= 8
    ) {
      let currentBoxId = String.fromCharCode(currentFile + 97) + currentRank;
      let currentBox = document.getElementById(currentBoxId);
      let boxContent = isBoxOccupied(currentBox);
      if (boxContent != "blank" && boxContent == pieceColor) return;
      legalBoxes.push(String.fromCharCode(currentFile + 97) + currentRank);
    }
  });
}

function moveToEighthRank(startingBoxId, pieceColor) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentRank = rankNumber;
  while (currentRank != 8) {
    currentRank++;
    let currentBoxId = file + currentRank;
    let currentBox = document.getElementById(currentBoxId);
    let boxContent = isBoxOccupied(currentBox);
    if (boxContent != "blank" && boxContent == pieceColor) return;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return;
  }
  return;
}

function moveToFirstRank(startingBoxId, pieceColor) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentRank = rankNumber;
  while (currentRank != 1) {
    currentRank--;
    let currentBoxId = file + currentRank;
    let currentBox = document.getElementById(currentBoxId);
    let boxContent = isBoxOccupied(currentBox);
    if (boxContent != "blank" && boxContent == pieceColor) return;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return;
  }
  return;
}

function moveToAFile(startingBoxId, pieceColor) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  let currentFile = file;
  while (currentFile != "a") {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) - 1
    );
    let currentBoxId = currentFile + rank;
    let currentBox = document.getElementById(currentBoxId);
    let boxContent = isBoxOccupied(currentBox);
    if (boxContent != "blank" && boxContent == pieceColor) return;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return;
  }
  return;
}

function moveToHFile(startingBoxId, pieceColor) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  let currentFile = file;
  while (currentFile != "h") {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) + 1
    );
    let currentBoxId = currentFile + rank;
    let currentBox = document.getElementById(currentBoxId);
    let boxContent = isBoxOccupied(currentBox);
    if (boxContent != "blank" && boxContent == pieceColor) return;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return;
  }
  return;
}

function moveToEighthRankAFile(startingBoxId, pieceColor) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  while (!(currentFile == "a" || currentRank == 8)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) - 1
    );
    currentRank++;
    let currentBoxId = currentFile + currentRank;
    let currentBox = document.getElementById(currentBoxId);
    let boxContent = isBoxOccupied(currentBox);
    if (boxContent != "blank" && boxContent == pieceColor) return;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return;
  }
}

function moveToEighthRankHFile(startingBoxId, pieceColor) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  while (!(currentFile == "h" || currentRank == 8)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) + 1
    );
    currentRank++;
    let currentBoxId = currentFile + currentRank;
    let currentBox = document.getElementById(currentBoxId);
    let boxContent = isBoxOccupied(currentBox);
    if (boxContent != "blank" && boxContent == pieceColor) return;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return;
  }
} 

function moveToFirstRankAFile(startingBoxId, pieceColor) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  while (!(currentFile == "a" || currentRank == 1)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) - 1
    );
    currentRank--;
    let currentBoxId = currentFile + currentRank;
    let currentBox = document.getElementById(currentBoxId);
    let boxContent = isBoxOccupied(currentBox);
    if (boxContent != "blank" && boxContent == pieceColor) return;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return;
  }
}

function moveToFirstRankHFile(startingBoxId, pieceColor) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  while (!(currentFile == "h" || currentRank == 1)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) + 1
    );
    currentRank--;
    let currentBoxId = currentFile + currentRank;
    let currentBox = document.getElementById(currentBoxId);
    let boxContent = isBoxOccupied(currentBox);
    if (boxContent != "blank" && boxContent == pieceColor) return;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return;
  }
}

