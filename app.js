const gameBoard = document.querySelector("#gameboard")
const playerDisplay = document.querySelector("#player")
const infoDisplay = document.querySelector("#info-display")
const whiteScoreDisplay = document.querySelector("#white-score")
const blackScoreDisplay = document.querySelector("#black-score")

const width = 8
let playerGo = 'white'
playerDisplay.textContent = playerGo

let whiteScore = 0
let blackScore = 0

let startPositionId
let draggedElement
let validMoves = []

const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook,
]

function createBoard() {
    startPieces.forEach((piece, i) => {
        const square = document.createElement('div')
        square.classList.add('square')
        square.setAttribute('square-id', i)

        const row = Math.floor(i / 8)
        square.classList.add(row % 2 === 0
            ? i % 2 === 0 ? 'beige' : 'brown'
            : i % 2 === 0 ? 'brown' : 'beige'
        )

        if (piece) {
            square.innerHTML = piece
            const pieceEl = square.firstChild
            pieceEl.classList.add(i < 32 ? 'black' : 'white')
            pieceEl.setAttribute('draggable', true)
        }

        square.addEventListener('dragstart', dragStart)
        square.addEventListener('dragover', e => e.preventDefault())
        square.addEventListener('drop', dragDrop)

        gameBoard.append(square)
    })
}

createBoard()

function dragStart(e) {
    draggedElement = e.target
    startPositionId = e.target.parentNode.getAttribute('square-id')

    if (!draggedElement.classList.contains(playerGo)) {
        draggedElement = null
        return
    }

    validMoves = getValidMoves(startPositionId)
    highlightMoves()
}

function dragDrop(e) {
    e.preventDefault()
    const targetSquare = e.target.closest('.square')
    if (!targetSquare) return

    const targetId = targetSquare.getAttribute('square-id')

    if (!validMoves.includes(Number(targetId))) return

    if (targetSquare.firstChild) {
        const capturedColor = targetSquare.firstChild.classList.contains('white') ? 'white' : 'black'
        if (capturedColor === 'white') blackScore++
        else whiteScore++
        updateScore()
        targetSquare.innerHTML = ''
    }

    targetSquare.append(draggedElement)
    promotePawn(targetId)
    clearHighlights()
    changePlayer()
}

function changePlayer() {
    playerGo = playerGo === 'white' ? 'black' : 'white'
    playerDisplay.textContent = playerGo
}

function updateScore() {
    whiteScoreDisplay.textContent = whiteScore
    blackScoreDisplay.textContent = blackScore
}

function highlightMoves() {
    validMoves.forEach(id => {
        document.querySelector(`[square-id="${id}"]`).classList.add('highlight')
    })
}

function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(sq => sq.classList.remove('highlight'))
}

function promotePawn(targetId) {
    const row = Math.floor(targetId / 8)
    if (
        draggedElement.id === 'pawn' &&
        ((playerGo === 'white' && row === 0) || (playerGo === 'black' && row === 7))
    ) {
        draggedElement.outerHTML = queen
        const newQueen = document.querySelector(`[square-id="${targetId}"]`).firstChild
        newQueen.classList.add(playerGo)
        newQueen.setAttribute('draggable', true)
    }
}

function getValidMoves(startId) {
    const piece = draggedElement.id
    const moves = []
    const start = Number(startId)

    const directions = {
        rook: [1, -1, 8, -8],
        bishop: [7, -7, 9, -9],
        queen: [1, -1, 8, -8, 7, -7, 9, -9],
        king: [1, -1, 8, -8, 7, -7, 9, -9],
    }

    if (piece === 'pawn') {
        const dir = playerGo === 'white' ? -8 : 8
        const oneStep = start + dir
        if (isEmpty(oneStep)) moves.push(oneStep)

        const captures = [dir - 1, dir + 1]
        captures.forEach(offset => {
            const target = start + offset
            if (isEnemy(target)) moves.push(target)
        })
    }

    if (piece === 'knight') {
        [15, 17, 10, 6, -15, -17, -10, -6].forEach(offset => {
            const target = start + offset
            if (isValid(target)) moves.push(target)
        })
    }

    if (directions[piece]) {
        directions[piece].forEach(dir => {
            let target = start + dir
            while (isOnBoard(target)) {
                if (isEmpty(target)) moves.push(target)
                else {
                    if (isEnemy(target)) moves.push(target)
                    break
                }
                if (piece === 'king') break
                target += dir
            }
        })
    }

    return moves.filter(isOnBoard)
}

function isEmpty(id) {
    const sq = document.querySelector(`[square-id="${id}"]`)
    return sq && !sq.firstChild
}

function isEnemy(id) {
    const sq = document.querySelector(`[square-id="${id}"]`)
    return sq && sq.firstChild && !sq.firstChild.classList.contains(playerGo)
}

function isValid(id) {
    return isOnBoard(id) && (!document.querySelector(`[square-id="${id}"]`).firstChild ||
        isEnemy(id))
}

function isOnBoard(id) {
    return id >= 0 && id < 64
}
