// Mes variables
let boardBoxesArray = [];
let isWhiteTurn = true;
let whiteKingBox = "e1";
let blackKingBox = "e8";
const boardBoxes = document.getElementsByClassName("box");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");

setupBoardBoxes();
setupPieces();
fillBoardBoxesArray();

function deepCopyArray(array) {
  let arrayCopy = array.map((element) => {
    return { ...element };
  });
  return arrayCopy;
}

function fillBoardBoxesArray() {
  const boardBoxes = document.getElementsByClassName("box");
  for (let i = 0; i < boardBoxes.length; i++) {
    let row = 8 - Math.floor(i / 8);
    let column = String.fromCharCode(97 + (i % 8));
    let box = boardBoxes[i];
    box.id = column + row;
    let color = "";
    let pieceType = "";
    let pieceId = "";
    if (box.querySelector(".piece")) {
      color = box.querySelector(".piece").getAttribute("color");
      pieceType = box.querySelector(".piece").classList[1];
      pieceId = box.querySelector(".piece").id;
    } else {
      color = "blank";
      pieceType = "blank";
      pieceId = "blank";
    }
    let arrayElement = {
      boxId: box.id,
      pieceColor: color,
      pieceType: pieceType,
      pieceId: pieceId,
    };
    boardBoxesArray.push(arrayElement);
  }
}

function updateBoardBoxesArray(
  currentBoxId,
  destinationBoxId,
  boardBoxesArray
) {
  let currentBox = boardBoxesArray.find(
    (element) => element.boxId === currentBoxId
  );
  let destinationBoxElement = boardBoxesArray.find(
    (element) => element.boxId === destinationBoxId
  );
  let pieceColor = currentBox.pieceColor;
  let pieceType = currentBox.pieceType;
  let pieceId = currentBox.pieceId;
  destinationBoxElement.pieceColor = pieceColor;
  destinationBoxElement.pieceType = pieceType;
  destinationBoxElement.pieceId = pieceId;
  currentBox.pieceColor = "blank";
  currentBox.pieceType = "blank";
  currentBox.pieceId = "blank";
}

//****************Drag and drop******************** */

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
  const pieceType = piece.classList[1];
  const pieceId = piece.id;
  if (
    (isWhiteTurn && pieceColor == "white") ||
    (!isWhiteTurn && pieceColor == "black")
  ) {
    const startingBoxId = piece.parentNode.id;
    ev.dataTransfer.setData("text", piece.id + "|" + startingBoxId);
    const pieceObject = {
      pieceColor: pieceColor,
      pieceType: pieceType,
      pieceId: pieceId,
    };
    let legalBoxes = getPossibleMoves(
      startingBoxId,
      pieceObject,
      boardBoxesArray
    );
    let legalBoxesJson = JSON.stringify(legalBoxes);
    ev.dataTransfer.setData("application/json", legalBoxesJson);
  } // tour des joueurs
}

function drop(ev) {
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  let [pieceId, startingBoxId] = data.split("|");
  let legalBoxesJson = ev.dataTransfer.getData("application/json");
  if (legalBoxesJson.length == 0) return;
  let legalBoxes = JSON.parse(legalBoxesJson);
  const piece = document.getElementById(pieceId);
  const pieceColor = piece.getAttribute("color");
  const pieceType = piece.classList[1];
  const destinationBox = ev.currentTarget;
  let destinationBoxId = destinationBox.id;
  legalBoxes = isMoveValidAgainstCheck(
    legalBoxes,
    startingBoxId,
    pieceColor,
    pieceType
  );
  if (pieceType == "king") {
    let isCheck = isKingInCheck(destinationBoxId, pieceColor, boardBoxesArray);
    if (isCheck) return;
    isWhiteTurn
      ? (whiteKingBox = destinationBoxId)
      : (blackKingBox = destinationBoxId);
  }
  let boxContent = getPieceAtBox(destinationBoxId, boardBoxesArray);

  //************Capture************** */
  if (
    boxContent.pieceColor == "blank" &&
    legalBoxes.includes(destinationBoxId)
  ) {
    destinationBox.appendChild(piece);
    isWhiteTurn = !isWhiteTurn; // tour des joueurs
    updateBoardBoxesArray(startingBoxId, destinationBoxId, boardBoxesArray);
    checkForCheckmate();
    return;
  }
  if (
    boxContent.pieceColor != "blank" &&
    legalBoxes.includes(destinationBoxId)
  ) {
    while (destinationBox.firstChild) {
      destinationBox.removeChild(destinationBox.firstChild);
    }
    destinationBox.appendChild(piece);
    isWhiteTurn = !isWhiteTurn; // tour des joueurs
    updateBoardBoxesArray(startingBoxId, destinationBoxId, boardBoxesArray);
    checkForCheckmate();
    return;
  }
}

function getPossibleMoves(startingBoxId, piece, boardBoxesArray) {
  const pieceColor = piece.pieceColor;
  const pieceType = piece.pieceType;
  let legalBoxes = [];

  if (pieceType === "pawn") {
    legalBoxes = getPawnMoves(startingBoxId, pieceColor, boardBoxesArray);
    return legalBoxes;
  }
  if (pieceType === "knight") {
    legalBoxes = getKnightMoves(startingBoxId, pieceColor, boardBoxesArray);
    return legalBoxes;
  }
  if (pieceType === "rook") {
    legalBoxes = getRookMoves(startingBoxId, pieceColor, boardBoxesArray);
    return legalBoxes;
  }
  if (pieceType === "bishop") {
    legalBoxes = getBishopMoves(startingBoxId, pieceColor, boardBoxesArray);
    return legalBoxes;
  }
  if (pieceType === "queen") {
    legalBoxes = getQueenMoves(startingBoxId, pieceColor, boardBoxesArray);
    return legalBoxes;
  }
  if (pieceType === "king") {
    legalBoxes = getKingMoves(startingBoxId, pieceColor, boardBoxesArray);
    return legalBoxes;
  }
}

function getPieceAtBox(boxId, boardBoxesArray) {
  let currentBox = boardBoxesArray.find((element) => element.boxId === boxId);
  const color = currentBox.pieceColor;
  const pieceType = currentBox.pieceType;
  const pieceId = currentBox.pieceId;
  return {
    pieceColor: color,
    pieceType: pieceType,
    pieceId: pieceId,
  };
}

//*****************fonction de chaque piece****************** */

function getPawnMoves(startingBoxId, pieceColor, boardBoxesArray) {
  let diagonalBoxes = checkPawnDiagonalCaptures(
    startingBoxId,
    pieceColor,
    boardBoxesArray
  );
  let forwardBoxes = checkPawnForwardMoves(
    startingBoxId,
    pieceColor,
    boardBoxesArray
  );
  let legalBoxes = [...diagonalBoxes, ...forwardBoxes];
  return legalBoxes;
}

function checkPawnDiagonalCaptures(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let currentBoxId = currentFile + currentRank;
  let legalBoxes = [];
  const direction = pieceColor == "white" ? 1 : -1;

  currentRank += direction;
  for (let i = -1; i <= 1; i += 2) {
    currentFile = String.fromCharCode(file.charCodeAt(0) + i);
    if (currentFile >= "a" && currentFile <= "h") {
      currentBoxId = currentFile + currentRank;
      let currentBox = boardBoxesArray.find(
        (element) => element.boxId === currentBoxId
      );
      const boxContent = currentBox.pieceColor;
      if (boxContent != "blank" && boxContent != pieceColor)
        legalBoxes.push(currentBoxId);
    }
  }
  return legalBoxes;
}
function checkPawnForwardMoves(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let currentBoxId = currentFile + currentRank;
  let legalBoxes = [];
  const direction = pieceColor == "white" ? 1 : -1;
  currentRank += direction;

  currentBoxId = currentFile + currentRank;
  let currentBox = boardBoxesArray.find(
    (element) => element.boxId === currentBoxId
  );
  let boxContent = currentBox.pieceColor;
  if (boxContent != "blank") {
    return legalBoxes;
  }
  legalBoxes.push(currentBoxId);
  if (rankNumber != 2 && rankNumber != 7) return legalBoxes;

  currentRank += direction;
  currentBoxId = currentFile + currentRank;
  currentBox = boardBoxesArray.find(
    (element) => element.boxId === currentBoxId
  );
  boxContent = currentBox.pieceColor;
  if (boxContent != "blank") {
    return legalBoxes;
  }
  legalBoxes.push(currentBoxId);
  return legalBoxes;
}

function getKnightMoves(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charCodeAt(0) - 97;
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalBoxes = [];

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
      let currentBox = boardBoxesArray.find(
        (element) => element.boxId === currentBoxId
      );
      let boxContent = currentBox.pieceColor;
      if (boxContent != "blank" && boxContent == pieceColor) {
        return legalBoxes;
      }
      legalBoxes.push(String.fromCharCode(currentFile + 97) + currentRank);
    }
  });
  return legalBoxes;
}

function getRookMoves(startingBoxId, pieceColor, boardBoxesArray) {
  let moveToEighthRankBoxes = moveToEighthRank(
    startingBoxId,
    pieceColor,
    boardBoxesArray
  );
  let moveToFirstRankBoxes = moveToFirstRank(
    startingBoxId,
    pieceColor,
    boardBoxesArray
  );
  let moveToAFileBoxes = moveToAFile(
    startingBoxId,
    pieceColor,
    boardBoxesArray
  );
  let moveToHFileBoxes = moveToHFile(
    startingBoxId,
    pieceColor,
    boardBoxesArray
  );
  let legalBoxes = [
    ...moveToEighthRankBoxes,
    ...moveToFirstRankBoxes,
    ...moveToAFileBoxes,
    ...moveToHFileBoxes,
  ];
  return legalBoxes;
}

function getBishopMoves(startingBoxId, pieceColor, boardBoxesArray) {
  let moveToEighthRankHFileBoxes = moveToEighthRankHFile(
    startingBoxId,
    pieceColor,
    boardBoxesArray
  );
  let moveToEighthRankAFileBoxes = moveToEighthRankAFile(
    startingBoxId,
    pieceColor,
    boardBoxesArray
  );
  let moveToFirstRankHFileBoxes = moveToFirstRankHFile(
    startingBoxId,
    pieceColor,
    boardBoxesArray
  );
  let moveToFirstRankAFileBoxes = moveToFirstRankAFile(
    startingBoxId,
    pieceColor,
    boardBoxesArray
  );
  let legalBoxes = [
    ...moveToEighthRankHFileBoxes,
    ...moveToEighthRankAFileBoxes,
    ...moveToFirstRankHFileBoxes,
    ...moveToFirstRankAFileBoxes,
  ];
  return legalBoxes;
}

function getQueenMoves(startingBoxId, pieceColor, boardBoxesArray) {
  let bishopMoves = getBishopMoves(startingBoxId, pieceColor, boardBoxesArray);
  let rookMoves = getRookMoves(startingBoxId, pieceColor, boardBoxesArray);
  let legalBoxes = [...bishopMoves, ...rookMoves];
  return legalBoxes;
}

function getKingMoves(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charCodeAt(0) - 97;
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalBoxes = [];

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
      let currentBox = boardBoxesArray.find(
        (element) => element.boxId === currentBoxId
      );
      let boxContent = currentBox.pieceColor;
      if (boxContent != "blank" && boxContent == pieceColor) return legalBoxes;
      legalBoxes.push(String.fromCharCode(currentFile + 97) + currentRank);
    }
  });
  return legalBoxes;
}

function moveToEighthRank(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentRank = rankNumber;
  let legalBoxes = [];
  while (currentRank != 8) {
    currentRank++;
    let currentBoxId = file + currentRank;
    let currentBox = boardBoxesArray.find(
      (element) => element.boxId === currentBoxId
    );
    let boxContent = currentBox.pieceColor;
    if (boxContent != "blank" && boxContent == pieceColor) return legalBoxes;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return legalBoxes;
  }
  return legalBoxes;
}

function moveToFirstRank(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentRank = rankNumber;
  let legalBoxes = [];
  while (currentRank != 1) {
    currentRank--;
    let currentBoxId = file + currentRank;
    let currentBox = boardBoxesArray.find(
      (element) => element.boxId === currentBoxId
    );
    let boxContent = currentBox.pieceColor;
    if (boxContent != "blank" && boxContent == pieceColor) return legalBoxes;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return legalBoxes;
  }
  return legalBoxes;
}

function moveToAFile(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  let currentFile = file;
  let legalBoxes = [];
  while (currentFile != "a") {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) - 1
    );
    let currentBoxId = currentFile + rank;
    let currentBox = boardBoxesArray.find(
      (element) => element.boxId === currentBoxId
    );
    let boxContent = currentBox.pieceColor;
    if (boxContent != "blank" && boxContent == pieceColor) return legalBoxes;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return legalBoxes;
  }
  return legalBoxes;
}

function moveToHFile(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  let currentFile = file;
  let legalBoxes = [];
  while (currentFile != "h") {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) + 1
    );
    let currentBoxId = currentFile + rank;
    let currentBox = boardBoxesArray.find(
      (element) => element.boxId === currentBoxId
    );
    let boxContent = currentBox.pieceColor;
    if (boxContent != "blank" && boxContent == pieceColor) return legalBoxes;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return legalBoxes;
  }
  return legalBoxes;
}

function moveToEighthRankAFile(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalBoxes = [];
  while (!(currentFile == "a" || currentRank == 8)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) - 1
    );
    currentRank++;
    let currentBoxId = currentFile + currentRank;
    let currentBox = boardBoxesArray.find(
      (element) => element.boxId === currentBoxId
    );
    let boxContent = currentBox.pieceColor;
    if (boxContent != "blank" && boxContent == pieceColor) return legalBoxes;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return legalBoxes;
  }
  return legalBoxes;
}

function moveToEighthRankHFile(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalBoxes = [];
  while (!(currentFile == "h" || currentRank == 8)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) + 1
    );
    currentRank++;
    let currentBoxId = currentFile + currentRank;
    let currentBox = boardBoxesArray.find(
      (element) => element.boxId === currentBoxId
    );
    let boxContent = currentBox.pieceColor;
    if (boxContent != "blank" && boxContent == pieceColor) return legalBoxes;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return legalBoxes;
  }
  return legalBoxes;
}

function moveToFirstRankAFile(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalBoxes = [];
  while (!(currentFile == "a" || currentRank == 1)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) - 1
    );
    currentRank--;
    let currentBoxId = currentFile + currentRank;
    let currentBox = boardBoxesArray.find(
      (element) => element.boxId === currentBoxId
    );
    let boxContent = currentBox.pieceColor;
    if (boxContent != "blank" && boxContent == pieceColor) return legalBoxes;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return legalBoxes;
  }
  return legalBoxes;
}

function moveToFirstRankHFile(startingBoxId, pieceColor, boardBoxesArray) {
  const file = startingBoxId.charAt(0);
  const rank = startingBoxId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalBoxes = [];
  while (!(currentFile == "h" || currentRank == 1)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) + 1
    );
    currentRank--;
    let currentBoxId = currentFile + currentRank;
    let currentBox = boardBoxesArray.find(
      (element) => element.boxId === currentBoxId
    );
    let boxContent = currentBox.pieceColor;
    if (boxContent != "blank" && boxContent == pieceColor) return legalBoxes;
    legalBoxes.push(currentBoxId);
    if (boxContent != "blank" && boxContent != pieceColor) return legalBoxes;
  }
  return legalBoxes;
}

function isKingInCheck(boxId, pieceColor, boardBoxesArray) {
  let legalBoxes = getRookMoves(boxId, pieceColor, boardBoxesArray);
  for (let boxId of legalBoxes) {
    let pieceProperties = getPieceAtBox(boxId, boardBoxesArray);
    if (
      (pieceProperties.pieceType == "rook" ||
        pieceProperties.pieceType == "queen") &&
      pieceColor != pieceProperties.pieceColor
    )
      return true;
  }
  legalBoxes = getBishopMoves(boxId, pieceColor, boardBoxesArray);
  for (let boxId of legalBoxes) {
    let pieceProperties = getPieceAtBox(boxId, boardBoxesArray);
    if (
      (pieceProperties.pieceType == "bishop" ||
        pieceProperties.pieceType == "queen") &&
      pieceColor != pieceProperties.pieceColor
    )
      return true;
  }
  legalBoxes = checkPawnDiagonalCaptures(boxId, pieceColor, boardBoxesArray);
  for (let boxId of legalBoxes) {
    let pieceProperties = getPieceAtBox(boxId, boardBoxesArray);
    if (
      pieceProperties.pieceType == "pawn" &&
      pieceColor != pieceProperties.pieceColor
    )
      return true;
  }
  legalBoxes = getKnightMoves(boxId, pieceColor, boardBoxesArray);
  for (let boxId of legalBoxes) {
    let pieceProperties = getPieceAtBox(boxId, boardBoxesArray);
    if (
      pieceProperties.pieceType == "knight" &&
      pieceColor != pieceProperties.pieceColor
    )
      return true;
  }
  legalBoxes = getKingMoves(boxId, pieceColor, boardBoxesArray);
  for (let boxId of legalBoxes) {
    let pieceProperties = getPieceAtBox(boxId, boardBoxesArray);
    if (
      pieceProperties.pieceType == "king" &&
      pieceColor != pieceProperties.pieceColor
    )
      return true;
  }
  return false;
}

function isMoveValidAgainstCheck(
  legalBoxes,
  startingBoxId,
  pieceColor,
  pieceType
) {
  let kingBox = isWhiteTurn ? whiteKingBox : blackKingBox;
  let boardBoxesArrayCopy = deepCopyArray(boardBoxesArray);
  let legalBoxesCopy = legalBoxes.slice();
  legalBoxesCopy.forEach((element) => {
    let destinationId = element;
    boardBoxesArrayCopy = deepCopyArray(boardBoxesArray);
    updateBoardBoxesArray(startingBoxId, destinationId, boardBoxesArrayCopy);
    if (
      pieceType != "king" &&
      isKingInCheck(kingBox, pieceColor, boardBoxesArrayCopy)
    ) {
      legalBoxes = legalBoxes.filter((item) => item != destinationId);
    }
    if (
      pieceType == "king" &&
      isKingInCheck(destinationId, pieceColor, boardBoxesArrayCopy)
    ) {
      legalBoxes = legalBoxes.filter((item) => item != destinationId);
    }
  });
  return legalBoxes;
}

function checkForCheckmate() {
  let kingBox = isWhiteTurn ? whiteKingBox : blackKingBox;
  let pieceColor = isWhiteTurn ? "white" : "black";
  let boardBoxesArrayCopy = deepCopyArray(boardBoxesArray);
  let kingIsCheck = isKingInCheck(kingBox, pieceColor, boardBoxesArrayCopy);
  if (!kingIsCheck) return;
  let possibleMoves = getAllPossibleMoves(boardBoxesArrayCopy, pieceColor);
  if (possibleMoves.length > 0) return;
  let message = "";
  isWhiteTurn ? (message = "Black Wins!") : (message = "White Wins!");
  showAlert(message);
}

function getAllPossibleMoves(boxesArray, color) {
  return boxesArray
    .filter((box) => box.pieceColor == color)
    .flatMap((box) => {
      const { pieceColor, pieceType, pieceId } = getPieceAtBox(
        box.boxId,
        boxesArray
      );
      if (pieceId == "blank") return [];
      let boxesArrayCopy = deepCopyArray(boxesArray);
      const pieceObject = {
        pieceColor: pieceColor,
        pieceType: pieceType,
        pieceId: pieceId,
      };
      let legalBoxes = getPossibleMoves(box.boxId, pieceObject, boxesArrayCopy);
      legalBoxes = isMoveValidAgainstCheck(
        legalBoxes,
        box.boxId,
        pieceColor,
        pieceType
      );
      return legalBoxes;
    });
}

function showAlert(message) {
  const alert = document.getElementById("alert");
  alert.innerHTML = message;
  alert.style.display = "block";

  setTimeout(function() {
    alert.style.display = "none";
  }, 3000);
}
