// ver 0.1
/*
TODO:
shrink
skip
non-square grid
*/

let w, h;
let cw, ch; //column width, height
let rw, rh; // row width, height
let d;
let x, y;
let b;
let offset = 120;
let score = 0;
let scores = [];
let scoreShow = false;
let path = [];
let rowPreview = false;
let colPreview = false;
let activeItem = 0;
let unequal = false; // for sum items
//undo storage
let backup = [];
let firstUndo = true;
let timesUndone = 0;
let justUndone = false;
restartConfirm = false;

let Bag = newBag();
let nextNumbers = [0, 0, 0];

let gameState // main, choice, dead

function setup() {
  createCanvas(1100, 1100);
  generateNext(5);
  textFont('Fredoka One');
  textAlign(CENTER, CENTER);
  gameState = "main";
}

function draw() {
  background(220);
  cw = (width-offset*2) / Grid.cols;
  ch = height;
  rw = width;
  rh = (width-offset*2) / Grid.rows;
  // grid coloring
  for (cn = 0; cn < Grid.cols; cn++) {
    for (rn = 0; rn < Grid.rows; rn++) {
      switch(Grid.map[cn][rn].color){
        case 0:
          switch(Grid.map[cn][rn].value){
            case 1:
              fill('#80BD68');
              break;
            case 2:
              fill('#69BA75');
              break;
            case 3:
              fill('#53B683');
              break;
            case 4:
              fill('#3FB290');
              break;
            case 5:
            case 6:
              fill('#31AC9C');
              break;
            case 8:
            case 12:
              fill('#2EA6A5');
              break;
            case 16:
            case 24:
              fill('#399FAC');
              break;
            case 48:
              fill('#4B97AF');
              break;
            case 96:
              fill('#5D8FAF');
              break;
            case 192:
              fill('#6F85AC');
              break;
            case 384:
              fill('#7F7CA5');
              break;
            case 768:
              fill('#8C729B');
              break;
            case 1536:
              fill('#96698E');
              break;
            case 182:
              fill('#9D6180');
              break;
            default:
              fill('#A05971');
              break;

          }
          break;
        case 1:
          fill(255, 204, 0);
          break;
        case 2:
          fill(206, 149, 0);
          break;
        case 3: // col, row
          fill('#aaf99a');
          break;
        case "turn": // turn
          fill(185, 142, 204);
          break;
        case "swap": // swap
        case "comboBreak": // swap
          fill(171, 236, 106);
          break;

        }
      let x = cn * cw;
      let y = rn * rh;
      strokeWeight(6);
      rect(x+offset, y+offset, cw, rh);
      fill(0, 0, 0);

      if(Grid.map[cn][rn].preview == 0) {
        // different text sizes for different digits
        if(Grid.map[cn][rn].value >= 1000) {
          textSize(73);
        } else if(Grid.map[cn][rn].value >= 100) {
          textSize(88);
        } else if(Grid.map[cn][rn].value >= 10){
          textSize(99);
        } else {
          textSize(110);
        }
        strokeWeight(0);
        text(Grid.map[cn][rn].value, x+cw/2+offset, y+rh/2+offset+4);
      } else {
        if(Grid.map[cn][rn].preview >= 1000) {
          textSize(73);
        } else if(Grid.map[cn][rn].preview >= 100) {
          textSize(88);
        } else if(Grid.map[cn][rn].preview >= 10){
          textSize(99);
        } else {
          textSize(110);
        }
        strokeWeight(0);
        text(Grid.map[cn][rn].preview, x+cw/2+offset, y+rh/2+offset+4);
      }
    }
  }

  drawCharges();
  itemDraw();
  textSize(80);
  strokeWeight(1);
  // game states
  if(!restartConfirm && gameState=="main") {
    if(checkAllSame() && path.length != 0) {
      for(let i = path.length; i <= nextNumbers.length; i++) {
        // display next number preview
        text(nextNumbers[i-1], (i-1)*cw+offset+cw, 0+offset/2);
      }
    } else {
      if(score != 0) {
        for(let i = 0; i < nextNumbers.length; i++) {
          text(nextNumbers[i], i*cw+offset+cw, 0+offset/2);
        }
      }
    }
  } else if(gameState == "level") {
    text("reached " + levelVal[level], offset+cw, 0+offset/2);
  } else if(gameState == "dead") {
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(55);
    text(usedItems, offset, 0+offset/2);
    // for(item in usedItems){
    //   text(usedItems[item], offset+item/(usedItems.length-1)*(width-offset*2), 0+offset/2);
    // }
    fill(155, 155, 155, 144);
    rect(offset + (width-offset*2)/4, offset + (height-offset*2)/4, (width-offset*2)/2, (height-offset*2)/2);
    textAlign(CENTER, CENTER);
    textSize(104);
    fill(0);
    text("Game", offset + (width-offset*2)*2.15/5, offset + (height-offset*2)*2.15/5);
    text("Over", offset + (width-offset*2)*2.85/5, offset + (height-offset*2)*2.85/5);
  }
  textAlign(RIGHT, CENTER);
  // display score
  if(path.length == 0) {
    if(restartConfirm && path.length == 0) {
      text("again to restart", offset, offset/2);
    } else if (score == 0) {
      textAlign(LEFT, CENTER);
      text("r to restart", offset, offset/2);
      textAlign(RIGHT, CENTER);
      text("u to undo", width-offset, height-offset/2);
    }
  }
  textAlign(RIGHT, CENTER);
  if(scoreShow && itemMode == 0){
    text("amt: " + scores.length + " avg: " + average(scores), width-offset, height-offset/2);
  } else if(itemMode != 0) {
    //show item text
    text(itemMode + ": " + Items[activeItem-1].charge, width-offset, height-offset/2);
  } else if(score != 0){
    text(score, width-offset, height-offset/2);
  }
  textAlign(CENTER, CENTER);
  if(gameState == "level"){
    itemDialog(selection);
  }
}

function keyPressed() {
  if (key == 'r') {
    restart();
  }
  if (key == '5') {
    restart5();
  }
  // if (key == 'x') {
  //   scores = [];
  // }
  if (key == 's') {
    scoreShow = !scoreShow;
  }
  if (key == 'u') {
    undo();
  }
  if (key == 'i') {
    alert(usedItems);
  }
  if (key == '1' && Items[0].charge > 0) {
    if(activeItem != 1) {
      itemMode = Items[0].type;
      activeItem = 1;
    } else {
      itemMode = 0;
      activeItem = 1;
    }
  }
  if (key == '2' && Items[1].charge > 0) {
    if(activeItem != 2) {
      itemMode = Items[1].type;
      activeItem = 2;
    } else {
      itemMode = 0;
      activeItem = 2;
    }
  }
  if (key == '3' && Items[2].charge > 0) {
    if(activeItem != 3) {
      itemMode = Items[2].type;
      activeItem = 3;
    } else {
      itemMode = 0;
      activeItem = 3;
    }
  }
  // if (key == '6') {
  //   itemMode = "swap";
  // }
  // if (key == '7') {
  //   itemMode = "col";
  // }
  // if (key == '8') {
  //   itemMode = "row";
  // }
  // if (key == '9') {
  //   itemMode = "grow";
  }

function mousePressed() {
  pressed();
}
function mouseDragged() {
  dragged();
}
function mouseReleased() {
  release();
}

function touchStarted() {
  pressed();
}
function touchMoved() {
  dragged();
  return false;
}
function touchEnded() {
  release();
}

function pressed() {
  if (mouseX >= width-offset && !justUndone) undo();
  if(gameState == "main") {
    if ( !(mouseX <= offset || mouseY <= offset || mouseX >= width-offset || mouseY >= height-offset) ) {
      let col = Math.floor((mouseX-offset)/cw);
      let row = Math.floor((mouseY-offset)/rh);
      Grid.map[col][row].select();
      restartConfirm = false;
      path.push([col, row]);
    }
    if (mouseButton === RIGHT) {
      path = [];
    }
    itemClick();
    itemPressed();
  } else if(gameState == "level") {
    levelPress(mouseX, mouseY);
  }
}
function dragged() {
  // mouse oputside of grid
  if ( bounds() ) {
    maxLength(0);
  } else {
    // get mouse position as grid coordinates
    let col = Math.floor((mouseX-offset)/cw);
    let row = Math.floor((mouseY-offset)/rh);

    // check if the drag crosses itself
    dragCross(col, row);

    // adding a cell to the array
    if(path.length > 0 && Grid.map[col][row].isNeighborOf(path[path.length-1][0], path[path.length-1][1])) {
      Grid.map[col][row].select()
      path.push([col, row]);
      if( itemMode == 0 ) {
        if(path.length-2 >= 0) {
          Grid.map[path[path.length-2][0]][path[path.length-2][1]].color = 2;
          Grid.map[path[path.length-2][0]][path[path.length-2][1]].preview = 0;
        }
        if(checkAllSame()){
          // preview combined number
          Grid.map[col][row].preview = Grid.map[col][row].value * path.length;
          // preview next numbers
          drawPreview();
        } else {
          for(let i = 0; i < path.length-1; i++) {
            Grid.map[path[i][0]][path[i][1]].preview = 0;
          }
        }
      }
    }
    if(itemMode) itemDrag();
  }
}
function release() {
  if (mouseY <= offset) {
    if (score != 0 && restartConfirm) {
      restartConfirm = false;
      restart();
    } else if (score != 0) {
      // restartConfirm = true;
    } else if(score==0) restart();
  }
  for(let row in Grid.map) {
    for(let col in Grid.map[row]) {
      Grid.map[col][row].deselect()
    }
  }
  // add the last move to the undo stack
  justUndone = false;

  if(path.length > 1 && !unequal){
    console.log("combining...");
    backup.push(addToUndo(Grid, nextNumbers, Bag, score));
    combineNumbers(path);
  }
  //execute Item abilities
  itemFinal();
  path = [];
}

function itemClick() {
  if ( (mouseX <= offset || mouseY <= offset || mouseX >= width-offset || mouseY >= height-offset) && itemMode != 0) {
    console.log("click out of bounds. canceling item.")
    itemMode = 0;
  }
  switch(itemMode) {
    case "row":
      rowPreview = true;
      if(path.length != 0) {
        Grid.map[0][path[0][1]].color = 3;
        Grid.map[1][path[0][1]].color = 3;
        Grid.map[2][path[0][1]].color = 3;
        Grid.map[3][path[0][1]].color = 3;
      }
      break;
    case "col":
      colPreview = true;
      if(path.length != 0) {
        Grid.map[path[0][0]][0].color = 3;
        Grid.map[path[0][0]][1].color = 3;
        Grid.map[path[0][0]][2].color = 3;
        Grid.map[path[0][0]][3].color = 3;
      }
      break;
    case "swap":
      if(path.length != 0) Grid.map[path[0][0]][path[0][1]].color = "swap";
      break;
    case "sum":
      unequal = true;
      break;
    case "sum4":
      unequal = true;
      break;
    case "sum6":
      unequal = true;
      break;
    case "grow":
      Grid.map[path[0][0]][path[0][1]].preview = Grid.map[path[0][0]][path[0][1]].value+1;
      break;
    case "turn":
      if(path.length == 1) Grid.map[path[0][0]][path[0][1]].color = "swap";
      // unequal = true;
      break;
    case "pick":
      let temp = nextNumbers.pop();
      nextNumbers.unshift([Grid.map[path[0][0]][path[0][1]].value]);
      Grid.map[path[0][0]][path[0][1]].value = temp[0];
      itemDeplete();
      break;
    case "shift":
      // Items[0].type = "shift"
      let temp2 = nextNumbers.shift();
      nextNumbers.push(temp2);
      itemDeplete();
      break;
    }

}
function itemDrag() {
  switch(itemMode) {
    case "row":
      maxLength(2);
      rowPreview = true;
      if(path.length != 0) {
        Grid.map[0][path[0][1]].color = 3;
        Grid.map[1][path[0][1]].color = 3;
        Grid.map[2][path[0][1]].color = 3;
        Grid.map[3][path[0][1]].color = 3;
      }
      if(path.length > 1){
        if(!(path[0][0] == path[1][0]+1 || path[0][0] == path[1][0]-1)) {
          maxLength(1);
        } else if(path[0][0] == path[1][0]+1) {
          Grid.map[0][path[1][1]].color = 3;
          Grid.map[1][path[1][1]].color = 3;
          Grid.map[2][path[1][1]].color = 3;
          Grid.map[3][path[1][1]].color = 3;
          Grid.map[3][path[0][1]].preview = Grid.map[0][path[0][1]].value;
          Grid.map[0][path[0][1]].preview = Grid.map[1][path[0][1]].value;
          Grid.map[1][path[0][1]].preview = Grid.map[2][path[0][1]].value;
          Grid.map[2][path[0][1]].preview = Grid.map[3][path[0][1]].value;
        } else if(path[0][0] == path[1][0]-1) {
          Grid.map[0][path[1][1]].color = 3;
          Grid.map[1][path[1][1]].color = 3;
          Grid.map[2][path[1][1]].color = 3;
          Grid.map[3][path[1][1]].color = 3;
          Grid.map[3][path[0][1]].preview = Grid.map[2][path[0][1]].value;
          Grid.map[2][path[0][1]].preview = Grid.map[1][path[0][1]].value;
          Grid.map[1][path[0][1]].preview = Grid.map[0][path[0][1]].value;
          Grid.map[0][path[0][1]].preview = Grid.map[3][path[0][1]].value;
        }
      }
      break;
    case "col":
      maxLength(2);
      colPreview = true;
      if(path.length != 0) {
        Grid.map[path[0][0]][0].color = 3;
        Grid.map[path[0][0]][1].color = 3;
        Grid.map[path[0][0]][2].color = 3;
        Grid.map[path[0][0]][3].color = 3;
      }
      if(path.length > 1){
        if(!(path[0][1] == path[1][1]+1 || path[0][1] == path[1][1]-1)) {
          maxLength(1);
        } else if(path[0][1] == path[1][1]+1) {
          Grid.map[path[0][0]][0].color = 3;
          Grid.map[path[0][0]][1].color = 3;
          Grid.map[path[0][0]][2].color = 3;
          Grid.map[path[0][0]][3].color = 3;
          Grid.map[path[0][0]][0].preview = Grid.map[path[0][0]][1].value;
          Grid.map[path[0][0]][1].preview = Grid.map[path[0][0]][2].value;
          Grid.map[path[0][0]][2].preview = Grid.map[path[0][0]][3].value;
          Grid.map[path[0][0]][3].preview = Grid.map[path[0][0]][0].value;
        } else if(path[0][1] == path[1][1]-1) {
          Grid.map[path[0][0]][0].color = 3;
          Grid.map[path[0][0]][1].color = 3;
          Grid.map[path[0][0]][2].color = 3;
          Grid.map[path[0][0]][3].color = 3;
          Grid.map[path[0][0]][0].preview = Grid.map[path[0][0]][3].value;
          Grid.map[path[0][0]][1].preview = Grid.map[path[0][0]][0].value;
          Grid.map[path[0][0]][2].preview = Grid.map[path[0][0]][1].value;
          Grid.map[path[0][0]][3].preview = Grid.map[path[0][0]][2].value;
        }
      }
      break;
    case "swap":
      maxLength(2);
      if(path.length != 0) Grid.map[path[0][0]][path[0][1]].color = "swap";
      if(path.length == 2) {
        Grid.map[path[1][0]][path[1][1]].color = "swap";
        Grid.map[path[0][0]][path[0][1]].preview = Grid.map[path[1][0]][path[1][1]].value;
        Grid.map[path[1][0]][path[1][1]].preview = Grid.map[path[0][0]][path[0][1]].value;
      }
      break;
    case "sum":
      //smaller than 4 means preview
      if(path.length == 2) {
        unequal = true;
        Grid.map[path[1][0]][path[1][1]].preview = Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value;
        Grid.map[path[0][0]][path[0][1]].preview = nextNumbers[0][0];
      }
      maxLength(2);
      break;
    case "sum4":
      if(path.length == 3) {
        //smaller than 4 means preview
        if(Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value + Grid.map[path[2][0]][path[2][1]].value <= 4) {
          unequal = true;
          Grid.map[path[2][0]][path[2][1]].preview = Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value + Grid.map[path[2][0]][path[2][1]].value;
          Grid.map[path[0][0]][path[0][1]].preview = nextNumbers[0];
          Grid.map[path[1][0]][path[1][1]].preview = nextNumbers[1];
        }
        // bigger than 4 means shorten
        if (Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value + Grid.map[path[2][0]][path[2][1]].value > 4) {
          maxLength(2);
        }
      }
      if(path.length == 2){
          if (Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value > 4) {
            maxLength(1);
            break;
          }
          if(Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value <= 4) {
            unequal = true;
            Grid.map[path[1][0]][path[1][1]].preview = Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value;
            Grid.map[path[0][0]][path[0][1]].preview = nextNumbers[0];
          }
        }
      break;
    case "sum6":
      if(path.length == 4) {
        //exactly 6 means preview
        if(Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value + Grid.map[path[2][0]][path[2][1]].value + Grid.map[path[3][0]][path[3][1]].value == 6) {
          unequal = true;
          Grid.map[path[3][0]][path[3][1]].preview = 6;
          Grid.map[path[2][0]][path[2][1]].preview = nextNumbers[2];
          Grid.map[path[1][0]][path[1][1]].preview = nextNumbers[1];
          Grid.map[path[0][0]][path[0][1]].preview = nextNumbers[0];
        } else {
          maxLength(3);
        }
      }
      if(path.length == 3){
        if(Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value + Grid.map[path[2][0]][path[2][1]].value == 6) {
          unequal = true;
          Grid.map[path[2][0]][path[2][1]].preview = 6;
          Grid.map[path[1][0]][path[1][1]].preview = nextNumbers[1];
          Grid.map[path[0][0]][path[0][1]].preview = nextNumbers[0];
        }
      }
      if(path.length == 2){
        if(Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value== 6) {
          unequal = true;
          Grid.map[path[1][0]][path[1][1]].preview = 6;
          Grid.map[path[0][0]][path[0][1]].preview = nextNumbers[0];
        }
      }
      break;
    case "grow":
      if(path.length > 1) maxLength(0);
      break;
    case "sort":
      if(path.length > 4) maxLength(4);
      let toSort = [];
      for(elem in path){
        toSort.push(Grid.map[path[elem][0]][path[elem][1]].value);
      }
      console.log(toSort);
      toSort.sort(function(a, b){return a-b});
      for(elem in path){
        Grid.map[path[elem][0]][path[elem][1]].preview = toSort[elem];
      }
      break;
    case "turn":
      if(path.length >= 1 && path.length <= 2) {
        Grid.map[path[0][0]][path[0][1]].color = "swap";
        Grid.map[path[0][0]][path[0][1]].preview = Grid.map[path[0][0]][path[0][1]].value;
      }
      if(path.length == 2) {
        Grid.map[path[1][0]][path[1][1]].color = "swap";
        Grid.map[path[1][0]][path[1][1]].preview = Grid.map[path[1][0]][path[1][1]].value;
      }
      if(path.length > 2) {
        for(let i = 0; i < path.length; i++) {
          Grid.map[path[i][0]][path[i][1]].color = "turn";
          console.log(Grid.map[path[i][0]][path[i][1]].color);
          Grid.map[path[0][0]][path[0][1]].preview = Grid.map[path[0][0]][path[0][1]].value;
          Grid.map[path[1][0]][path[1][1]].preview = Grid.map[path[1][0]][path[1][1]].value;
        }
      }
      if(path.length > 4) maxLength(4);
      if(path.length == 4) {
        Grid.map[path[0][0]][path[0][1]].preview = Grid.map[path[1][0]][path[1][1]].value;
        Grid.map[path[1][0]][path[1][1]].preview = Grid.map[path[2][0]][path[2][1]].value;
        Grid.map[path[2][0]][path[2][1]].preview = Grid.map[path[3][0]][path[3][1]].value;
        Grid.map[path[3][0]][path[3][1]].preview = Grid.map[path[0][0]][path[0][1]].value;
      } else if (path.length == 3) {
        Grid.map[path[0][0]][path[0][1]].preview = Grid.map[path[1][0]][path[1][1]].value;
        Grid.map[path[1][0]][path[1][1]].preview = Grid.map[path[2][0]][path[2][1]].value;
        Grid.map[path[2][0]][path[2][1]].preview = Grid.map[path[0][0]][path[0][1]].value;
      }
      break;
    case "shrink":
      if(path.length > 2) maxLength(2);
      if(path.length == 2 && Grid.map[path[0][0]][path[0][1]].value > Grid.map[path[1][0]][path[1][1]].value) {
        Grid.map[path[0][0]][path[0][1]].preview = Grid.map[path[1][0]][path[1][1]].value;
      } else {
        maxLength(1);
      }
      break;
  }
}
function itemFinal(){
  switch(itemMode) {
    case "row":
    if(path.length > 1){
      if(!(path[0][0] == path[1][0]+1 || path[0][0] == path[1][0]-1)) {
        maxLength(1);
      } else if(path[0][0] == path[1][0]+1) {
        let placeHold = Grid.map[3][path[0][1]].value;
        Grid.map[3][path[0][1]].value = Grid.map[0][path[0][1]].value;
        Grid.map[0][path[0][1]].value = Grid.map[1][path[0][1]].value;
        Grid.map[1][path[0][1]].value = Grid.map[2][path[0][1]].value;
        Grid.map[2][path[0][1]].value = placeHold;
        maxLength(0);
        itemDeplete();
      } else if(path[0][0] == path[1][0]-1) {
        let placeHold = Grid.map[3][path[0][1]].value;
        Grid.map[3][path[0][1]].value = Grid.map[2][path[0][1]].value;
        Grid.map[2][path[0][1]].value = Grid.map[1][path[0][1]].value;
        Grid.map[1][path[0][1]].value = Grid.map[0][path[0][1]].value;
        Grid.map[0][path[0][1]].value = placeHold;
        maxLength(0);
        itemDeplete();
      }
    }
      break;
    case "col":
      if(path.length > 1){
        if(!(path[0][1] == path[1][1]+1 || path[0][1] == path[1][1]-1)) {
          maxLength(1);
        } else if(path[0][1] == path[1][1]+1) {
          let placeHold = Grid.map[path[0][0]][3].value;
          Grid.map[path[0][0]][3].value = Grid.map[path[0][0]][0].value;
          Grid.map[path[0][0]][0].value = Grid.map[path[0][0]][1].value;
          Grid.map[path[0][0]][1].value = Grid.map[path[0][0]][2].value;
          Grid.map[path[0][0]][2].value = placeHold;
          maxLength(0);
          itemDeplete();
        } else if(path[0][1] == path[1][1]-1) {
          let placeHold = Grid.map[path[0][0]][3].value;
          Grid.map[path[0][0]][3].value = Grid.map[path[0][0]][2].value;
          Grid.map[path[0][0]][2].value = Grid.map[path[0][0]][1].value;
          Grid.map[path[0][0]][1].value = Grid.map[path[0][0]][0].value;
          Grid.map[path[0][0]][0].value = placeHold;
          maxLength(0);
          itemDeplete();
        }
      }
      break;
    case "swap":
      if(path.length == 2 && Grid.map[path[0][0]][path[0][1]].value != Grid.map[path[1][0]][path[1][1]].value) {
        let swap = Grid.map[path[0][0]][path[0][1]].value
        Grid.map[path[0][0]][path[0][1]].value = Grid.map[path[1][0]][path[1][1]].value;
        Grid.map[path[1][0]][path[1][1]].value = swap;
        maxLength(0);
        itemDeplete();
      }
      path = [];
      break;
    case "sum":
      if(path.length == 2) {
        Grid.map[path[1][0]][path[1][1]].value = Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value;
        Grid.map[path[0][0]][path[0][1]].value = generateNext(1);
        itemDeplete();
      }
      break;
    case "sum4":
      if(path.length == 3) {
        console.log(Grid.map[path[2][0]][path[2][1]].value);
        //smaller than 4 means preview
        if(Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value + Grid.map[path[2][0]][path[2][1]].value <= 4) {
          Grid.map[path[2][0]][path[2][1]].value = Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value + Grid.map[path[2][0]][path[2][1]].value;
          Grid.map[path[0][0]][path[0][1]].value = nextNumbers[0][0];
          Grid.map[path[1][0]][path[1][1]].value = nextNumbers[1][0];
        }
        itemDeplete();
      }
      if(path.length == 2){
        if(Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value <= 4) {
          Grid.map[path[1][0]][path[1][1]].value = Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value;
          Grid.map[path[0][0]][path[0][1]].value = nextNumbers[0][0];
        }
        itemDeplete();
      }
      break;
    case "sum6":
      if(path.length == 4) {
        console.log(Grid.map[path[2][0]][path[2][1]].value);
        //exactly 6 means preview
        if(Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value + Grid.map[path[2][0]][path[2][1]].value + Grid.map[path[3][0]][path[3][1]].value == 6) {
          Grid.map[path[3][0]][path[3][1]].value = 6;
          Grid.map[path[2][0]][path[2][1]].value = generateNext(0);
          Grid.map[path[1][0]][path[1][1]].value = generateNext(0);
          Grid.map[path[0][0]][path[0][1]].value = generateNext(0);
          itemDeplete();
        }
      }
      if(path.length == 3){
        if(Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value + Grid.map[path[2][0]][path[2][1]].value == 6) {
          Grid.map[path[2][0]][path[2][1]].value = 6;
          Grid.map[path[1][0]][path[1][1]].value = generateNext(0);
          Grid.map[path[0][0]][path[0][1]].value = generateNext(0);
          itemDeplete();
        }
      }
      if(path.length == 2){
        if(Grid.map[path[0][0]][path[0][1]].value + Grid.map[path[1][0]][path[1][1]].value == 6) {
          Grid.map[path[1][0]][path[1][1]].value = 6;
          Grid.map[path[0][0]][path[0][1]].value = nextNumbers[0][0];
          itemDeplete();
        }
      }
      break;
    case "grow":
      if(path.length == 1) {
        Grid.map[path[0][0]][path[0][1]].value = Grid.map[path[0][0]][path[0][1]].value+1;
        itemDeplete();;
      } else if (!bounds()) {
        maxLength(0);
      }
      break;
    case "turn":
      if(path.length > 4) maxLength(4);
      let temp;
      if(path.length == 4) {
        temp = Grid.map[path[0][0]][path[0][1]].value;
        Grid.map[path[0][0]][path[0][1]].value = Grid.map[path[1][0]][path[1][1]].value;
        Grid.map[path[1][0]][path[1][1]].value = Grid.map[path[2][0]][path[2][1]].value;
        Grid.map[path[2][0]][path[2][1]].value = Grid.map[path[3][0]][path[3][1]].value;
        Grid.map[path[3][0]][path[3][1]].value = temp;
        itemDeplete();
      } else if (path.length == 3) {path
        temp = Grid.map[path[0][0]][path[0][1]].value;
        Grid.map[path[0][0]][path[0][1]].value = Grid.map[path[1][0]][path[1][1]].value;
        Grid.map[path[1][0]][path[1][1]].value = Grid.map[path[2][0]][path[2][1]].value;
        Grid.map[path[2][0]][path[2][1]].value = temp;
        itemDeplete();
      }
      break;
    case "sort":
      if(path.length >= 3) {
        let toSort = [];
        for(elem in path){
          toSort.push(Grid.map[path[elem][0]][path[elem][1]].value);
        }
        console.log(toSort);
        toSort.sort(function(a, b){return a-b});
        for(elem in path){
          Grid.map[path[elem][0]][path[elem][1]].value = toSort[elem];
        }
        itemDeplete();
      }
      break;
    case "shrink":
      if(path.length == 2 && Grid.map[path[0][0]][path[0][1]].value > Grid.map[path[1][0]][path[1][1]].value) {
        score -= Grid.map[path[0][0]][path[0][1]].value - Grid.map[path[1][0]][path[1][1]].value;
        console.log("score decreased by" + Grid.map[path[0][0]][path[0][1]].value - Grid.map[path[1][0]][path[1][1]].value);
        Grid.map[path[0][0]][path[0][1]].value = Grid.map[path[1][0]][path[1][1]].value;
        itemDeplete();
      }
      break;
  }
}

// returns the icon for the item type
function itemIcon(type) {
  let toShow = " ";
  switch(type) {
    case "grow":
    toShow = "1"
    break;
    case "swap":
    toShow = "x";
    break;
    case "col":
    toShow = "|";
    break;
    case "row":
    toShow = "-";
    break;
    case "shift":
    toShow = "<";
    break;
    case "pick":
    toShow = ">";
    break;
    case "sum":
    toShow = "+";
    break;
    case "sum4":
    toShow = "4";
    break;
    case "sum6":
    toShow = "6";
    break;
    case "turn":
    toShow = "O";
    break;
    case "sort":
    toShow = "V";
    break;
    case "shuffle":
    toShow = "~";
    break;
    case "shrink":
    toShow = "*";
    break;
  }
  return toShow;
}
// reduce item charge by 1
function itemDeplete() {
  Items[activeItem-1].charge--;
  if(Items[activeItem-1].charge<=0){
    Items[activeItem-1].depleted = true;
  }
  backup = [];
  activeItem = 0;
  itemMode = 0;
  unequal = false;
}
// item side display
function itemDraw(){
  let itemOff = 30;
  //item display
  fill(133, 133, 133, 111);
  stroke(0);
  for(let i = 0; i < Items.length; i++) {
    if (Items[i] != 0) if(Items[i].charge > 0) {
      textAlign(CENTER,CENTER);
      textSize(55);
      let from = color('#D9889CDD');
      let to = color('#5D768B99');
      if(Items[i].charge < 7) {
        fill(lerpColor(from, to,Items[i].charge /7));
      }
      strokeWeight(6);
      if(i == activeItem-1){
        fill(123,231,213);
      }
      rect(0+itemOff/2, i*((width-offset*2) / 3)+offset, (cw-itemOff)/2, (width-offset*2) / 3);
      textSize(85);
      fill(0);
      strokeWeight(0);
      text(itemIcon(Items[i].type), 0+itemOff*3/4, (i+.5)*((width-offset*2) / 3)+offset, (cw-itemOff)/2);
      fill(133);
    }
  }
  fill(0);
}
// item selection dialog draw
function itemDialog(selection) {
  // console.log(selection);
  for(let item = 0; item <= selection.length-1; item++) {
    let extraOff = 30;
    let xOffset = ( (width-(offset+extraOff)*2) /selection.length)
    let xShift = offset+extraOff+ ( (width-(offset+extraOff)*2) /selection.length) /2
    fill('#32cd60');
    rectMode(CORNER);
    strokeWeight(10);
    rect(offset+extraOff+xOffset*item,height/3,xOffset,height/3);
    if(selection[item].hasOwnProperty('type')) {
      strokeWeight(25);
      stroke('#0e5e07');
      textSize(166);
      textAlign(CENTER, CENTER);
      fill('#070707');
      text(itemIcon(selection[item].type),xOffset*item+xShift,(height)*1.5/3+20);
      strokeWeight(0);
      textSize(72);
      fill('#092717');
      textAlign(LEFT, CENTER);
      text(selection[item].type,xOffset*item+offset+extraOff*2,(height)*1.5/3-130);
      fill('#123420');
      textAlign(RIGHT, CENTER);
      text("x" + selection[item].charge,xOffset*item+offset+extraOff+ ( (width-(offset+extraOff)*2) /selection.length)*.9,(height)*1.5/3+122);
    } else {
      strokeWeight(0);
      textSize(72);
      textAlign(LEFT, CENTER);
      fill('#092717');
      text("chg",xOffset*item+offset+extraOff*2,(height)*1.5/3-130);
      fill('#123420');
      textAlign(RIGHT, CENTER);
      text("+" + selection[item],xOffset*item+offset+extraOff+ ( (width-(offset+extraOff)*2) /selection.length)*.9,(height)*1.5/3+122);
    }
    stroke(0);
    textAlign(CENTER, CENTER);
  }
}

function levelPress(x, y) {
  // console.log(offset+extraOff+xOffset*item, x, );
  let extraOff = 30;
  let xOffset = ( (width-(offset+extraOff)*2) /selection.length);
  let xShift = offset+extraOff+ ( (width-(offset+extraOff)*2) /selection.length) /2;
  for(let item = 0; item <= selection.length-1; item++) {
    if(x > offset+extraOff+xOffset*item && x < offset+extraOff+xOffset*(item+1)) {
      // selection[item] is the selected item
      if(selection[item].hasOwnProperty('type')) {
        // duplicate prevention
        for(itm in Items) {
          if(Items[itm].hasOwnProperty("type") && Items[itm].hasOwnProperty('charge')){
            if(Items[itm].type == selection[item].type && !Items[itm].type.depleted) {
              console.log("type match ", selection[item].type);
              let gain = selection[item].charge;
              Items[itm].charge += gain;
              usedItems.push(itemIcon(Items[itm].type)+ ";" + gain);
              selection = 0;
              break;
            }
          }
        }
        // find first empty slot
        if(selection!=0){
          for(itm in Items) {
            if(Items[itm]==0 || Items[itm].depleted == true){
              usedItems.push(itemIcon(selection[item].type)+ " " + selection[item].charge);
              Items[itm] = selection[item];
              selection = 0;
              break;
            }
          }
        }
      } else {
        // add charges
        let randChoice;
        randChoice = Math.floor(Math.random()*Items.length);
        while(Items[randChoice]==0) randChoice = Math.floor(Math.random()*Items.length); //todo infinite
        Items[randChoice].charge += selection[item];
        usedItems.push(itemIcon(Items[randChoice].type)+ ":" + selection[item]);
        selection = 0;
      }
    }
  }
  if(x > offset+extraOff && x<width-(offset+extraOff)) {
    level++;
    gameState = 'main';
    isLeveled(lastComboVal);
  }
}

// clicking on a sidebar item activates it
function itemPressed() {
  let itemHeight = ((width-offset*2) / 3);
  if(score!=0){
    if( 0 < mouseX && mouseX < offset && offset < mouseY && mouseY < offset+itemHeight ){
      console.log(1);
      if (Items[0].charge > 0) {
        if(activeItem != 1) {
          itemMode = Items[0].type;
          activeItem = 1;
        } else {
          itemMode = 0;
          activeItem = 0;
          unequal = false;
        }
      }
    } else if( 0 < mouseX && mouseX < offset && offset+itemHeight < mouseY && mouseY < offset+itemHeight*2 ){
      if (Items[1].charge > 0) {
        if(activeItem != 2) {
          itemMode = Items[1].type;
          activeItem = 2;
        } else {
          itemMode = 0;
          activeItem = 0;
          unequal = false;
        }
      }
    } else if( 0 < mouseX && mouseX < offset && offset+itemHeight*2 < mouseY && mouseY < offset+itemHeight*3 ){
      if (Items[2].charge > 0) {
        if(activeItem != 3) {
          itemMode = Items[2].type;
          activeItem = 3;
        } else {
          itemMode = 0;
          activeItem = 0;
          unequal = false;
        }
      }
    }
  }
}

//check if a drag selection crosses itself
function dragCross(col, row) {
  for(let element = 0; element < path.length-1; element++){
    if(path[element][0] == col && path[element][1] == row){
      // remove all objects after intersection
      maxLength(element+1);
      if(checkAllSame()) {
        Grid.map[col][row].preview = Grid.map[col][row].value * path.length;
        // preview next numbers
        drawPreview();
      }
    }
  }
}
// reduces the length of the path array
function maxLength(length) {
  if(colPreview && length <= 1) {
    Grid.map[path[0][0]][0].deselect;
    Grid.map[path[0][0]][1].deselect;
    Grid.map[path[0][0]][2].deselect;
    Grid.map[path[0][0]][3].deselect;
    Grid.map[path[0][0]][0].preview = Grid.map[path[0][0]][0].value;
    Grid.map[path[0][0]][1].preview = Grid.map[path[0][0]][1].value;
    Grid.map[path[0][0]][2].preview = Grid.map[path[0][0]][2].value;
    Grid.map[path[0][0]][3].preview = Grid.map[path[0][0]][3].value;
    console.log("wiping col preview");
    colPreview = false;
  }
  if(rowPreview && length == 1) {
    Grid.map[0][path[0][0]].deselect;
    Grid.map[1][path[0][0]].deselect;
    Grid.map[2][path[0][0]].deselect;
    Grid.map[3][path[0][0]].deselect;
    Grid.map[0][path[0][0]].preview = Grid.map[0][path[0][0]].value;
    Grid.map[1][path[0][0]].preview = Grid.map[1][path[0][0]].value;
    Grid.map[2][path[0][0]].preview = Grid.map[2][path[0][0]].value;
    Grid.map[3][path[0][0]].preview = Grid.map[3][path[0][0]].value;
    console.log("wiping row preview");
    rowPreview = false;
  }
  while(path.length > length) {
    Grid.map[path[path.length-1][0]][path[path.length-1][1]].deselect();
    path.splice(path.length-1);
  }
}
// draws the on grid piece previews
function drawPreview() {
  for(let i = 1; i < path.length; i++){
    let prevCol = path[path.length-1-i][0]
    let prevRow = path[path.length-1-i][1]
    if(path.length-i-1 >= nextNumbers.length) {
      Grid.map[prevCol][prevRow].preview = "?";
    } else {
      Grid.map[prevCol][prevRow].preview = nextNumbers[path.length-i-1];
    }
  }
}
// checks if all numbers are equal and color after break
function checkAllSame() {
  let notSame = false;
  let firstBreak = -1;
  if(itemMode == 0) {
    for(let element = 0; element < path.length-1; element++){
        if( Grid.map[ path[element][0] ] [ path[element][1] ].value
        != Grid.map[ path[element+1][0] ] [ path[element+1][1] ].value && notSame == false) {
            notSame = true;
            firstBreak = element;
        }
    }
    // change preview color if numbers are not equal
    if (notSame) {
      for(firstBreak++; firstBreak < path.length-1; firstBreak++){
        Grid.map[ path[firstBreak][0] ] [ path[firstBreak][1] ].color = "comboBreak";
        console.log("2");
      }
      return false;
    }
  }
  return true;
}
// combine function takes an array of positions and combines to the last position
function combineNumbers(combine) {
  if(itemMode == 0) {
    // compare positions with grid values and check if numbers match
    for(let position = 0; position < combine.length-1; position++){
      if(Grid.map[combine[position][0]][combine[position][1]].value
      != Grid.map[ combine[position+1][0]][combine[position+1][1] ].value){
        console.log("numbers not equal");
        return false;
      }
    }
    // multiply last with amount of equal cells
    Grid.map[combine[combine.length-1][0]][combine[combine.length-1][1]].value *= combine.length;
    isLeveled(Grid.map[combine[combine.length-1][0]][combine[combine.length-1][1]].value);
    score += Grid.map[combine[combine.length-1][0]][combine[combine.length-1][1]].value;
    addCharge();
    // // generate new numbers for all other slots
    for(let position in combine) {
      if(position != combine.length-1){
        Grid.map[ combine[position][0]][combine[position][1] ].newValue();
      }
      // increase score if preview length reached
      let bonus = Grid.map[combine[combine.length-1][0]][combine[combine.length-1][1]].value;
      if(position > nextNumbers.length) {
        score += bonus;
        console.log(bonus);
        backup = [];
      }
    }
    firstUndo = true;
    if(gameOver()){
      gameState = "dead";
    }
  }
}
// get the average score
function average(average) {
    let sum = 0;
    for(let i = 0; i < average.length; i++) sum += average[i];
    return Math.floor(sum/average.length);
}
// check if the cursor is inside the grid
function bounds() {
  if (mouseX <= offset || mouseY <= offset || mouseX >= width-offset || mouseY >= width-offset) return true;
  return false;
}

// restart the game
function restart() {
  Grid = createGrid(4, 4);
  if(score != 0) scores.push(score);
  level = 0;
  unequal = false; // for sum items
  backup = [];
  // backup.push(addToUndo(Grid, nextNumbers, Bag, score));
  score = 0;
  nextNumbers = [0, 0, 0];
  timesUndone = 0;
  firstUndo = true;
  undoCharges = 5;
  gameState = "main";
  itemMode = 0;
  usedItems = [];
  activeItem = 0;
  generateNext(5);
  Bag = newBag();
  Items = [0,0,0];
  Items = initItem(Items);
}
function restart5() {
  Grid = createGrid(5, 5);
  level = 0;
  backup = [];
  unequal = false;
  // backup.push(addToUndo(Grid, nextNumbers, Bag, score));
  score = 0;
  nextNumbers = [0, 0, 0, 0];
  timesUndone = 0;
  undoCharges = 5;
  firstUndo = true;
  gameState = "main";
  itemMode = 0;
  usedItems = [];
  generateNext(5);
  Bag = newBag();
  Items = [0,0,0];
  Items = initItem(Items);
}

// generate a bag of 3x123
function newBag(bag = []) {
  let addBag = [];
  for(let i = 1; i<=3; i++) {
    for(let j = 0; j < 3; j++) {
      addBag.push(i);
      addBag = shuffle(addBag);
    }
  }
  for(num in addBag) bag.push(addBag[num]);
  return bag;
}
// draws and returns a number from the bag, possibly refill bag
function drawBag() {
  if(Bag.length <= 100) Bag = newBag(Bag);
  // Bag = shuffle(Bag);
  return Bag.splice(0,1);
}
// shuffles an array
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// draw from the bag to fill the preview
function generateNext(amount=1) {
  let fiFo;
  for(let i = 0; i < amount; i++) {
    fiFo = nextNumbers.splice(0,1);
    nextNumbers.push(drawBag());
  }
  if(amount == 1) {
    return parseInt(fiFo);
  }
}

function gameOver() {
  let noMatch = true;
  for(let i = 0; i < Grid.cols; i++) {
    for(let j = 0; j < Grid.rows-1; j++) {
      if(Grid.map[i][j].value == Grid.map[i][j+1].value){
          noMatch = false;
          // console.log(Grid.map[i][j].value, Grid.map[i][j+1].value);
      }
    }
  }
  for(let i = 0; i < Grid.rows; i++) {
    for(let j = 0; j < Grid.cols-1; j++) {
      if(Grid.map[j][i].value == Grid.map[j+1][i].value){
          noMatch = false;
          // console.log(Grid.map[j][i].value, Grid.map[j+1][i].value);
      }
    }
  }
  if(noMatch) {
    console.log("Game Over");
    return true;
  }
  return false;
}
