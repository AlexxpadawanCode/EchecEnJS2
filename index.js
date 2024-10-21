// Mes variables
let boardBoxesArray = [];
let moves = [];
const castlingBoxes = ["g1", "g8", "c1", "c8"];
let isWhiteTurn = true;
let enPassantBox = "blank";
let allowMovement = true;
const boardBoxes = document.getElementsByClassName("box");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");
const chessBoard = document.querySelector(".chessBoard");

setupBoardBoxes();
setupPieces();
fillBoardBoxesArray();

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
  boardBoxesArray,
  promotionOption = "blank"
) {
  let currentBox = boardBoxesArray.find(
    (element) => element.boxId === currentBoxId
  );
  let destinationBoxElement = boardBoxesArray.find(
    (element) => element.boxId === destinationBoxId
  );
  let pieceColor = currentBox.pieceColor;
  let pieceType =
    promotionOption == "blank" ? currentBox.pieceType : promotionOption;
  let pieceId =
    promotionOption == "blank"
      ? currentBox.pieceId
      : promotionOption + currentBox.pieceId;
  destinationBoxElement.pieceColor = pieceColor;
  destinationBoxElement.pieceType = pieceType;
  destinationBoxElement.pieceId = pieceId;
  currentBox.pieceColor = "blank";
  currentBox.pieceType = "blank";
  currentBox.pieceId = "blank";
}

function makeMove(
  startingBoxId,
  destinationBoxId,
  pieceType,
  pieceColor,
  captured,
  promotedTo = "blank"
) {
  moves.push({
    from: startingBoxId,
    to: destinationBoxId,
    pieceType: pieceType,
    pieceColor: pieceColor,
    captured: captured,
    promotedTo: promotedTo,
  });
}

function performEnPassant(piece, pieceColor, startingBoxId, destinationBoxId) {
  let file = destinationBoxId[0];
  let rank = parseInt(destinationBoxId[1]);
  rank += pieceColor === "white" ? -1 : 1;
  let boxBehindId = file + rank;

  const boxBehindElement = document.getElementById(boxBehindId);
  while (boxBehindElement.firstChild) {
    boxBehindElement.removeChild(boxBehindElement.firstChild);
  }

  let boxBehind = boardBoxesArray.find(
    (element) => element.boxId === boxBehindId
  );
  boxBehind.pieceColor = "blank";
  boxBehind.pieceType = "blank";
  boxBehind.pieceId = "blank";

  const destinationBox = document.getElementById(destinationBoxId);
  destinationBox.appendChild(piece);
  isWhiteTurn = !isWhiteTurn;
  updateBoardBoxesArray(startingBoxId, destinationBoxId, boardBoxesArray);
  let captured = true;
  makeMove(startingBoxId, destinationBoxId, "pawn", pieceColor, captured);
  checkForCheckmate();
  return;
}

function displayPromotionChoices(
  pieceId,
  pieceColor,
  startingBoxId,
  destinationBoxId,
  captured
) {
  let file = destinationBoxId[0];
  let rank = parseInt(destinationBoxId[1]);
  let rank1 = pieceColor === "white" ? rank - 1 : rank + 1;
  let rank2 = pieceColor === "white" ? rank - 2 : rank + 2;
  let rank3 = pieceColor === "white" ? rank - 3 : rank + 3;

  let boxBehindId1 = file + rank1;
  let boxBehindId2 = file + rank2;
  let boxBehindId3 = file + rank3;

  const destinationBox = document.getElementById(destinationBoxId);
  const boxBehind1 = document.getElementById(boxBehindId1);
  const boxBehind2 = document.getElementById(boxBehindId2);
  const boxBehind3 = document.getElementById(boxBehindId3);

  let piece1 = createChessPiece("queen", pieceColor, "promotionOption");
  let piece2 = createChessPiece("knight", pieceColor, "promotionOption");
  let piece3 = createChessPiece("rook", pieceColor, "promotionOption");
  let piece4 = createChessPiece("bishop", pieceColor, "promotionOption");

  destinationBox.appendChild(piece1);
  boxBehind1.appendChild(piece2);
  boxBehind2.appendChild(piece3);
  boxBehind3.appendChild(piece4);

  let promotionOptions = document.getElementsByClassName("promotionOption");
  for (let i = 0; i < promotionOptions.length; i++) {
    let pieceType = promotionOptions[i].classList[1];
    promotionOptions[i].addEventListener("click", function () {
      performPromotion(
        pieceId,
        pieceType,
        pieceColor,
        startingBoxId,
        destinationBoxId,
        captured
      );
    });
  }
}

function createChessPiece(pieceType, color, pieceClass) {
  let pieceName =
    color.charAt(0).toUpperCase() +
    color.slice(1) +
    "-" +
    pieceType.charAt(0).toUpperCase() +
    pieceType.slice(1) +
    ".png";
  let pieceDiv = document.createElement("div");
  pieceDiv.className = `${pieceClass} ${pieceType}`;
  pieceDiv.setAttribute("color", color);
  let img = document.createElement("img");
  img.src = "assets/img/" + pieceName;
  img.alt = pieceType;
  pieceDiv.appendChild(img);
  return pieceDiv;
}

chessBoard.addEventListener("click", clearPromotionOptions);

function clearPromotionOptions() {
  for (let i = 0; i < boardBoxes.length; i++) {
    let style = getComputedStyle(boardBoxes[i]);
    let backgroundColor = style.backgroundColor;
    let rgbaColor = backgroundColor.replace("0.5)", "1)");
    boardBoxes[i].style.backgroundColor = rgbaColor;
    boardBoxes[i].style.opacity = 1;

    if (boardBoxes[i].querySelector(".piece"))
      boardBoxes[i].querySelector(".piece").style.opacity = 1;
  }
  let elementsToRemove = chessBoard.querySelectorAll(".promotionOption");
  elementsToRemove.forEach(function (element) {
    element.parentElement.removeChild(element);
  });
  allowMovement = true;
}

function updateBoardBoxesOpacity(startingBoxId) {
  for (let i = 0; i < boardBoxes.length; i++) {
    if (boardBoxes[i].id == startingBoxId)
      boardBoxes[i].querySelector(".piece").style.opacity = 0;

    if (!boardBoxes[i].querySelector(".promotionOption")) {
      boardBoxes[i].style.opacity = 0.5;
    } else {
      let style = getComputedStyle(boardBoxes[i]);
      let backgroundColor = style.backgroundColor;
      let rgbaColor = backgroundColor
        .replace("rgb", "rgba")
        .replace(")", ",0.5)");
      boardBoxes[i].style.backgroundColor = rgbaColor;

      if (boardBoxes[i].querySelector(".piece"))
        boardBoxes[i].querySelector(".piece").style.opacity = 0;
    }
  }
}

function performPromotion(
  pieceId,
  pieceType,
  pieceColor,
  startingBoxId,
  destinationBoxId,
  captured,
  
) {
  clearPromotionOptions();
  promotionPiece = pieceType;
  piece = createChessPiece(pieceType, pieceColor, "piece");

  piece.addEventListener("dragstart", drag);
  piece.setAttribute("draggable", true);
  piece.firstChild.setAttribute("draggable", false);
  piece.id = pieceType + pieceId;

  const startingBox = document.getElementById(startingBoxId);
  while (startingBox.firstChild) {
    startingBox.removeChild(startingBox.firstChild);
  }
  const destinationBox = document.getElementById(destinationBoxId);

  if (captured) {
    let children = destinationBox.children;
    for (let i = 0; i < children.length; i++) {
      if (!children[i].classList.contains("coordinate")) {
        destinationBox.removeChild(children[i]);
      }
    }
  }
  destinationBox.appendChild(piece);
  isWhiteTurn = !isWhiteTurn;
  updateBoardBoxesArray(
    startingBoxId,
    destinationBoxId,
    boardBoxesArray,
    pieceType
  );
  makeMove(
    startingBoxId,
    destinationBoxId,
    pieceType,
    pieceColor,
    captured,
    pieceType
  );
  checkForCheckmate();
  return;
}

function deepCopyArray(array) {
  let arrayCopy = array.map((element) => {
    return { ...element };
  });
  return arrayCopy;
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

function performCastling(
  piece,
  pieceColor,
  startingBoxId,
  destinationBoxId,
  boardBoxesArray
) {
  let rookId, rookDetinationBoxId, checkBoxId;
  if (destinationBoxId == "g1") {
    rookId = "rookh1";
    rookDetinationBoxId = "f1";
    checkBoxId = "f1";
  } else if (destinationBoxId == "c1") {
    rookId = "rooka1";
    rookDetinationBoxId = "d1";
    checkBoxId = "d1";
  } else if (destinationBoxId == "g8") {
    rookId = "rookh8";
    rookDetinationBoxId = "f8";
    checkBoxId = "f8";
  } else if (destinationBoxId == "c8") {
    rookId = "rooka8";
    rookDetinationBoxId = "d8";
    checkBoxId = "d8";
  }
  if (isKingInCheck(checkBoxId, pieceColor, boardBoxesArray)) return;
  let rook = document.getElementById(rookId);
  let rookDetinationBox = document.getElementById(rookDetinationBoxId);
  rookDetinationBox.appendChild(rook);
  updateBoardBoxesArray(
    rook.id.slice(-2),
    rookDetinationBox.id,
    boardBoxesArray
  );
  const destinationBox = document.getElementById(destinationBoxId);
  destinationBox.appendChild(piece);
  isWhiteTurn = !isWhiteTurn;
  updateBoardBoxesArray(startingBoxId, destinationBoxId, boardBoxesArray);
  let captured = false;
  makeMove(startingBoxId, destinationBoxId, "king", pieceColor, captured);
  checkForCheckmate();
  return;
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
  if (!allowMovement) return;
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
  }
  let boxContent = getPieceAtBox(destinationBoxId, boardBoxesArray);

  //************Capture************** */
  if (
    boxContent.pieceColor == "blank" &&
    legalBoxes.includes(destinationBoxId)
  ) {
    let isCheck = false;
    if (pieceType == "king")
      isCheck = isKingInCheck(startingBoxId, pieceColor, boardBoxesArray);
    if (
      pieceType == "king" &&
      !kingHasMoved(pieceColor) &&
      castlingBoxes.includes(destinationBoxId) &&
      !isCheck
    ) {
      performCastling(
        piece,
        pieceColor,
        startingBoxId,
        destinationBoxId,
        boardBoxesArray
      );
      return;
    }
    if (
      pieceType == "king" &&
      !kingHasMoved(pieceColor) &&
      castlingBoxes.includes(destinationBoxId) &&
      isCheck
    )
      return;

    if (pieceType == "pawn" && enPassantBox == destinationBoxId) {
      performEnPassant(piece, pieceColor, startingBoxId, destinationBoxId);
      enPassantBox = "blank";
      return;
    }

    if (
      pieceType == "pawn" &&
      (destinationBoxId.charAt(1) == 8 || destinationBoxId.charAt(1) == 1)
    ) {
      allowMovement = false;
      displayPromotionChoices(
        pieceId,
        pieceColor,
        startingBoxId,
        destinationBoxId,
        false
      );
      updateBoardBoxesOpacity(startingBoxId);
      return;
    }

    destinationBox.appendChild(piece);
    isWhiteTurn = !isWhiteTurn; // tour des joueurs
    updateBoardBoxesArray(startingBoxId, destinationBoxId, boardBoxesArray);
    let captured = false;
    makeMove(startingBoxId, destinationBoxId, pieceType, pieceColor, captured);
    checkForCheckmate();
    return;
  }
  if (
    boxContent.pieceColor != "blank" &&
    legalBoxes.includes(destinationBoxId)
  ) {
    if (
      pieceType == "pawn" &&
      (destinationBoxId.charAt(1) == 8 || destinationBoxId.charAt(1) == 1)
    ) {
      allowMovement = false;
      displayPromotionChoices(
        pieceId,
        pieceColor,
        startingBoxId,
        destinationBoxId,
        true
      );
      updateBoardBoxesOpacity(startingBoxId);
      return;
    }
    while (destinationBox.firstChild) {
      destinationBox.removeChild(destinationBox.firstChild);
    }
    destinationBox.appendChild(piece);
    isWhiteTurn = !isWhiteTurn; // tour des joueurs
    updateBoardBoxesArray(startingBoxId, destinationBoxId, boardBoxesArray);
    let captured = true;
    makeMove(startingBoxId, destinationBoxId, pieceType, pieceColor, captured);
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
      if (boxContent == "blank") {
        currentBoxId = currentFile + rank;
        let pawnStartingBoxRank = rankNumber + direction * 2;
        let pawnStartingBoxId = currentFile + pawnStartingBoxRank;

        if (enPassantPossible(currentBoxId, pawnStartingBoxId, direction)) {
          let pawnStartingBoxRank = rankNumber + direction;
          let enPassantBox = currentFile + pawnStartingBoxRank;
          legalBoxes.push(enPassantBox);
        }
      }
    }
  }
  return legalBoxes;
}

function enPassantPossible(currentBoxId, pawnStartingBoxId, direction) {
  if (moves.length == 0) return false;
  let lastMove = moves[moves.length - 1];
  if (
    !(
      lastMove.to === currentBoxId &&
      lastMove.from === pawnStartingBoxId &&
      lastMove.pieceType == "pawn"
    )
  )
    return false;
  file = currentBoxId[0];
  rank = parseInt(currentBoxId[1]);
  rank += direction;
  let boxBehindId = file + rank;
  enPassantBox = boxBehindId;
  return true;
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
  if (!((rankNumber == 2 && pieceColor == "white") || (rankNumber == 7 && pieceColor == "black"))) return legalBoxes;


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
  let shortCastleBox = isShortCastlePossible(pieceColor, boardBoxesArray);
  let longCastleBox = isLongCastlePossible(pieceColor, boardBoxesArray);
  if (shortCastleBox != "blank") legalBoxes.push(shortCastleBox);
  if (longCastleBox != "blank") legalBoxes.push(longCastleBox);
  return legalBoxes;
}

function isShortCastlePossible(pieceColor, boardBoxesArray) {
  let rank = pieceColor === "white" ? "1" : "8";
  let fBox = boardBoxesArray.find((element) => element.boxId === `f${rank}`);
  let gBox = boardBoxesArray.find((element) => element.boxId === `g${rank}`);
  if (
    fBox.pieceColor !== "blank" ||
    gBox.pieceColor !== "blank" ||
    kingHasMoved(pieceColor) ||
    rookHasMoved(pieceColor, `h${rank}`)
  ) {
    return "blank";
  }
  return `g${rank}`;
}

function isLongCastlePossible(pieceColor, boardBoxesArray) {
  let rank = pieceColor === "white" ? "1" : "8";
  let dBox = boardBoxesArray.find((element) => element.boxId === `d${rank}`);
  let cBox = boardBoxesArray.find((element) => element.boxId === `c${rank}`);
  let bBox = boardBoxesArray.find((element) => element.boxId === `b${rank}`);

  if (
    dBox.pieceColor !== "blank" ||
    cBox.pieceColor !== "blank" ||
    bBox.pieceColor !== "blank" ||
    kingHasMoved(pieceColor) ||
    rookHasMoved(pieceColor, `a${rank}`)
  ) {
    return "blank";
  }
  return `c${rank}`;
}

function kingHasMoved(pieceColor) {
  let result = moves.find(
    (element) =>
      element.pieceColor === pieceColor && element.pieceType === "king"
  );
  if (result != undefined) return true;
  return false;
}

function rookHasMoved(pieceColor, startingBoxId) {
  let result = moves.find(
    (element) =>
      element.pieceColor === pieceColor &&
      element.pieceType === "rook" &&
      element.from == startingBoxId
  );
  if (result != undefined) return true;
  return false;
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

function getkingLastMove(color) {
  let kingLastMove = moves.find(
    (element) => element.pieceType === "king" && element.pieceColor === color
  );
  if (kingLastMove == undefined) return isWhiteTurn ? "e1" : "e8";
  return kingLastMove.to;
}

function isMoveValidAgainstCheck(
  legalBoxes,
  startingBoxId,
  pieceColor,
  pieceType
) {
  let kingBox = isWhiteTurn
    ? getkingLastMove("white")
    : getkingLastMove("black");
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
  let kingBox = isWhiteTurn
    ? getkingLastMove("white")
    : getkingLastMove("black");
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

  setTimeout(function () {
    alert.style.display = "none";
  }, 3000);
}
