
// Carga y prepara el modelo
tf.ready().then(() => {
  const modelPath = 'model/ttt_model.json'
  tf.tidy(() => {
    tf.loadLayersModel(modelPath).then((model) => {
      // Obtén las celdas del tablero
      const cells = document.querySelectorAll('.cell')

      // Estado del tablero
      let boardState = [0, 0, 0, 0, 0, 0, 0, 0, 0]
      let currentPlayer = 1 // Jugador humano: 1, Jugador computadora: -1
      let gameFinished = false

      // Puntajes
      let playerScore = 0
      let computerScore = 0

      // Función para dibujar la selección del jugador en el tablero
      function drawSelection(cellIndex) {
        if (!gameFinished && boardState[cellIndex] === 0) {
          cells[cellIndex].innerText = currentPlayer === 1 ? 'X' : 'O'
          boardState[cellIndex] = currentPlayer

          // Verificar si alguien ganó o empató
          if (checkWin(currentPlayer)) {
            if (currentPlayer === 1) {
              console.log('¡Ganaste!')
              playerScore++
              document.getElementById('player-score').innerText = playerScore
            } else {
              console.log('¡Gana la computadora!')
              computerScore++
              document.getElementById('computer-score').innerText = computerScore
            }
            gameFinished = true
            return
          } else if (checkDraw()) {
            console.log('¡Empate!')
            gameFinished = true
            return
          }

          // Cambiar de jugador
          currentPlayer *= -1

          // Dejar que la computadora juegue
          if (currentPlayer === -1) {
            computerPlay()
          }
        }
      }

      // Función para que la computadora juegue
      function computerPlay() {
        // Crear un tensor del estado actual del tablero
        const tensor = tf.tensor([boardState])

        // Predecir la jugada de la computadora
        const prediction = model.predict(tensor)

        // Mostrar las predicciones en la consola
        prediction.data().then((preds) => {
          console.log('Predicciones:', preds)
        })

        // Obtener la mejor jugada
        const bestMove = tf.argMax(prediction, 1).arraySync()[0]

        // Dibujar la selección de la computadora en el tablero
        drawSelection(bestMove)
      }

      // Función para verificar si alguien ganó
      function checkWin(player) {
        const winningCombinations = [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
          [0, 4, 8],
          [2, 4, 6]
        ]

        return winningCombinations.some(combination => {
          return (
            boardState[combination[0]] === player &&
            boardState[combination[1]] === player &&
            boardState[combination[2]] === player
          )
        })
      }

      // Función para verificar si hay un empate
      function checkDraw() {
        return boardState.every(cell => cell !== 0)
      }

      // Agregar el evento click a cada celda del tablero
      cells.forEach((cell, index) => {
        cell.addEventListener('click', () => {
          drawSelection(index)
        })
      })

      // Obtener el botón de reinicio
      const resetButton = document.getElementById('reset-button')

      // Agregar evento click al botón de reinicio
      resetButton.addEventListener('click', () => {
        resetGame()
      })

      // Función para reiniciar el juego
      function resetGame() {
        cells.forEach((cell) => {
          cell.innerText = ''
        })

        boardState = [0, 0, 0, 0, 0, 0, 0, 0, 0]
        currentPlayer = 1
        gameFinished = false
      }
    })
  })
})
