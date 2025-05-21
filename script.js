// Update current time
function updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const currentTimeElement = document.getElementById('currentTime');
    
    // Update hours
    updateTimeUnit(currentTimeElement.querySelector('.hours.current'), 
                  currentTimeElement.querySelector('.hours.next'), 
                  hours);
    
    // Update minutes
    updateTimeUnit(currentTimeElement.querySelector('.minutes.current'), 
                  currentTimeElement.querySelector('.minutes.next'), 
                  minutes);
    
    // Update seconds
    updateTimeUnit(currentTimeElement.querySelector('.seconds.current'), 
                  currentTimeElement.querySelector('.seconds.next'), 
                  seconds);

    // Update current date
    updateCurrentDate(now);
}

function updateTimeUnit(currentDigit, nextDigit, newValue) {
    if (currentDigit.textContent !== newValue) {
        // Set the new value in the next digit
        nextDigit.textContent = newValue;
        
        // Start the animation
        currentDigit.classList.add('slide-down');
        nextDigit.classList.remove('next');
        nextDigit.classList.add('current');
        
        // After animation, reset the positions
        setTimeout(() => {
            currentDigit.classList.remove('current', 'slide-down');
            currentDigit.classList.add('next');
            currentDigit.textContent = newValue;
        }, 300);
    }
}

// Scramble effect for date
function scrambleText(element, finalText, duration = 3600, scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', frameInterval = 60) {
    element.classList.add('scramble-animate');
    const scrambleLength = finalText.length;
    let frame = 0;
    const totalFrames = Math.floor(duration / frameInterval);
    let revealProgress = 0;

    function randomChar() {
        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
    }

    function scrambleFrame() {
        let display = '';
        for (let i = 0; i < scrambleLength; i++) {
            if (i < revealProgress) {
                display += finalText[i];
            } else {
                display += randomChar();
            }
        }
        element.textContent = display;
        frame++;
        if (frame < totalFrames) {
            if (frame % Math.floor(totalFrames / scrambleLength) === 0 && revealProgress < scrambleLength) {
                revealProgress++;
            }
            setTimeout(scrambleFrame, frameInterval);
        } else {
            element.textContent = finalText;
            element.classList.remove('scramble-animate');
        }
    }
    scrambleFrame();
}

function updateCurrentDate(dateObj) {
    const dateElement = document.getElementById('currentDate');
    if (!dateElement) return;
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    // e.g. "Wednesday, May 21"
    const dateStr = dateObj.toLocaleDateString(undefined, options);
    // Only scramble on initial load
    if (!dateElement.dataset.scrambled) {
        scrambleText(dateElement, dateStr, 1800, undefined, 60);
        dateElement.dataset.scrambled = 'true';
    } else {
        dateElement.textContent = dateStr;
    }
}

// Todo List functionality
function createTodoItem(text) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.draggable = true;
    
    // Drag handle
    const dragHandle = document.createElement('span');
    dragHandle.className = 'material-icons drag-handle';
    dragHandle.textContent = 'drag_indicator';
    li.appendChild(dragHandle);
    
    // Todo text
    const todoText = document.createElement('span');
    todoText.className = 'todo-text';
    todoText.textContent = text;
    li.appendChild(todoText);
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    const removeIcon = document.createElement('span');
    removeIcon.className = 'material-icons';
    removeIcon.textContent = 'close';
    removeBtn.appendChild(removeIcon);
    removeBtn.onclick = () => {
        li.classList.add('removing');
        // Wait for animation to complete before removing
        setTimeout(() => {
            li.remove();
            saveTodoItems(); // Save after removing an item
            // Check the number of todo items after removal
            const todoItems = document.querySelectorAll('.todo-item');
            if (todoItems.length < 8) {
                document.getElementById('showAddTodo').style.opacity = '1'; // Reset opacity if less than 8 items
                // Remove color change logic - the button will always be white
            }
        }, 300);
    };
    li.appendChild(removeBtn);
    
    // Append the new todo item to the list
    const todoList = document.getElementById('todoList');
    todoList.appendChild(li);
    
    // Check the number of todo items after adding
    const todoItems = todoList.querySelectorAll('.todo-item');
    if (todoItems.length >= 8) {
        document.getElementById('showAddTodo').style.opacity = '0.3'; // Set opacity to 0.3 if 8 or more items
        // Remove color change logic - the button will always be white
    }
    
    return li;
}

// Save todo items to storage
function saveTodoItems() {
    const todoList = document.getElementById('todoList');
    const items = todoList.querySelectorAll('.todo-item');
    const todoItems = Array.from(items).map(item => {
        return item.querySelector('.todo-text').textContent;
    });
    
    // Check if chrome.storage is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ todoItems: todoItems }, function() {
            console.log('Todo items saved');
        });
    } else {
        // Fallback to localStorage if chrome.storage is not available
        localStorage.setItem('todoItems', JSON.stringify(todoItems));
    }
}

// Load todo items from storage
function loadTodoItems() {
    // Check if chrome.storage is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(['todoItems'], function(result) {
            if (result.todoItems && result.todoItems.length > 0) {
                const todoList = document.getElementById('todoList');
                result.todoItems.forEach(text => {
                    const todoItem = createTodoItem(text);
                    todoList.appendChild(todoItem);
                });
            }
        });
    } else {
        // Fallback to localStorage if chrome.storage is not available
        const savedItems = localStorage.getItem('todoItems');
        if (savedItems) {
            const todoItems = JSON.parse(savedItems);
            const todoList = document.getElementById('todoList');
            todoItems.forEach(text => {
                const todoItem = createTodoItem(text);
                todoList.appendChild(todoItem);
            });
        }
    }
}

function setupDragAndDrop() {
    const todoList = document.getElementById('todoList');
    let draggedItem = null;

    todoList.addEventListener('dragstart', (e) => {
        draggedItem = e.target;
        e.target.classList.add('dragging');
        // Disable animations while dragging
        e.target.style.animation = 'none';
        e.target.style.transition = 'none';
    });

    todoList.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        // Re-enable animations after dragging
        e.target.style.animation = '';
        e.target.style.transition = '';
        saveTodoItems(); // Save after drag and drop
    });

    todoList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(todoList, e.clientY);
        const currentDragging = document.querySelector('.dragging');
        if (afterElement == null) {
            todoList.appendChild(currentDragging);
        } else {
            todoList.insertBefore(currentDragging, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function showTodoInput() {
    const todoInput = document.querySelector('.todo-input');
    const showAddTodoBtn = document.getElementById('showAddTodo');
    const todoList = document.getElementById('todoList');
    const todoItems = todoList.querySelectorAll('.todo-item');
    const message = document.getElementById('message');

    if (todoItems.length >= 8) {
        // If 8 or more items, set opacity to 0.3 and do not show input
        showAddTodoBtn.style.opacity = '0.3';
        // Add wiggle animation
        showAddTodoBtn.classList.add('wiggle');
        // Remove the wiggle class after animation completes
        setTimeout(() => {
            showAddTodoBtn.classList.remove('wiggle');
        }, 500);

        // Show the message with fade in
        message.style.display = 'block';
        message.style.opacity = '1'; // Fade in
        // Hide the message after 1 second with fade out
        setTimeout(() => {
            message.style.opacity = '0'; // Fade out
            setTimeout(() => {
                message.style.display = 'none';
            }, 300); // Wait for fade out to complete
        }, 1000);

        return; // Exit the function
    }

    if (todoInput && showAddTodoBtn) {
        todoInput.style.display = 'flex';
        showAddTodoBtn.style.display = 'none';
        document.getElementById('todoInput').focus();
        
        // Add click outside listener
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);
    }
}

function hideTodoInput() {
    const todoInput = document.querySelector('.todo-input');
    const showAddTodoBtn = document.getElementById('showAddTodo');
    if (todoInput && showAddTodoBtn) {
        todoInput.style.display = 'none';
        showAddTodoBtn.style.display = 'flex';
        document.getElementById('todoInput').value = '';
        
        // Remove click outside listener
        document.removeEventListener('click', handleClickOutside);
    }
}

function handleClickOutside(event) {
    const todoInput = document.querySelector('.todo-input');
    const inputContainer = document.querySelector('.input-container');
    const confirmBtn = document.getElementById('addTodo');
    
    // Check if the click was outside the input field and confirm button
    if (todoInput && 
        !todoInput.contains(event.target) && 
        !inputContainer.contains(event.target) && 
        !confirmBtn.contains(event.target)) {
        hideTodoInput();
    }
}

function updateTimeUnitWidth() {
    const currentDigit = document.querySelector('.time-digit.current');
    if (currentDigit) {
        const digitWidth = currentDigit.getBoundingClientRect().width;
        const timeUnit = currentDigit.closest('.time-unit');
        if (timeUnit) {
            timeUnit.style.minWidth = `${digitWidth}px`;
        }
    }
}

// Call this function whenever the time updates
updateTimeUnitWidth();

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update time immediately and then every second
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // Todo list functionality
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodo');
    const showAddTodoBtn = document.getElementById('showAddTodo');
    const todoList = document.getElementById('todoList');

    if (addTodoBtn && todoInput && todoList && showAddTodoBtn) {
        // Load saved todo items
        loadTodoItems();

        // Debug log
        console.log('Setting up event listeners');

        showAddTodoBtn.addEventListener('click', function(e) {
            console.log('Add button clicked');
            e.stopPropagation(); // Prevent click from being caught by document
            showTodoInput();
        });

        addTodoBtn.addEventListener('click', function(e) {
            console.log('Confirm button clicked');
            e.stopPropagation(); // Prevent click from being caught by document
            const text = todoInput.value.trim();
            if (text) {
                const todoItem = createTodoItem(text);
                todoList.appendChild(todoItem);
                saveTodoItems(); // Save after adding a new item
                hideTodoInput();
            }
        });

        todoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('Enter key pressed');
                e.stopPropagation(); // Prevent click from being caught by document
                addTodoBtn.click();
            } else if (e.key === 'Escape') {
                hideTodoInput();
            }
        });

        // Prevent clicks inside the input from closing it
        todoInput.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        setupDragAndDrop();
    } else {
        console.error('Some elements were not found:', {
            todoInput: !!todoInput,
            addTodoBtn: !!addTodoBtn,
            showAddTodoBtn: !!showAddTodoBtn,
            todoList: !!todoList
        });
    }
    
    // Initialize starlight effect
    initStarlight();
});

// Starlight effect initialization
function initStarlight() {
    const container = document.getElementById('stars-container');
    const starCount = 450; // Number of stars
    
    // Create canvas for more efficient rendering
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Array to store star data
    const stars = [];
    
    // Create stars data
    for (let i = 0; i < starCount; i++) {
        stars.push(createStar());
    }
    
    // Track mouse movement
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Reposition stars on resize
        stars.forEach(star => {
            star.x = star.xPercent * window.innerWidth / 100;
            star.y = star.yPercent * window.innerHeight / 100;
        });
    });
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Calculate mouse offset from center (normalized to -1 to 1)
        const offsetX = (mouseX - centerX) / centerX;
        const offsetY = (mouseY - centerY) / centerY;
        
        // Calculate max distance for brightness calculation
        const maxDistance = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / 8; // Reduced to make the effect more pronounced
        
        // Update and draw each star
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            
            // Update twinkle animation - make the blinking more noticeable
            star.twinklePhase += star.twinkleSpeed;
            if (star.twinklePhase > 2 * Math.PI) {
                star.twinklePhase -= 2 * Math.PI;
            }
            
            // Calculate opacity based on twinkle animation with more pronounced effect
            const twinkleFactor = (Math.sin(star.twinklePhase) + 1) / 2; // 0 to 1
            const baseOpacity = star.maxOpacity * 0.2 + twinkleFactor * star.maxOpacity * 0.8; // More variation in opacity
            
            // Apply parallax movement (increased effect)
            const shiftX = offsetX * star.parallaxFactor * window.innerWidth / 25; // Doubled parallax effect
            const shiftY = offsetY * star.parallaxFactor * window.innerHeight / 25; // Doubled parallax effect
            
            const finalX = star.x + shiftX;
            const finalY = star.y + shiftY;
            
            // Calculate distance from mouse for brightness boost
            const distance = Math.sqrt(Math.pow(mouseX - finalX, 2) + Math.pow(mouseY - finalY, 2));
            const brightnessBoost = Math.max(0, 1 - (distance / maxDistance));
            
            // Increase the brightness effect for stars near cursor (multiplied by 2)
            const finalOpacity = Math.min(0.8, baseOpacity + brightnessBoost * 0.2); // Increased brightness boost
            
            // Set fill style based on star color and opacity
            ctx.fillStyle = star.color.replace('OPACITY', finalOpacity);
            
            // Draw star with glow effect for larger stars and stars near cursor
            const glowSize = star.size * (1 + brightnessBoost * 2); // Larger glow for stars near cursor
            
            if (star.size > 1.2 || brightnessBoost > 0.3) { // Also add glow to stars near cursor
                // Draw glow
                const glow = ctx.createRadialGradient(
                    finalX, finalY, 0,
                    finalX, finalY, glowSize * 2
                );
                glow.addColorStop(0, star.color.replace('OPACITY', finalOpacity * 0.8));
                glow.addColorStop(1, star.color.replace('OPACITY', 0));
                
                ctx.beginPath();
                ctx.fillStyle = glow;
                ctx.arc(finalX, finalY, glowSize * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw star with size variation based on proximity to cursor
            const starSize = star.size * (1 + brightnessBoost * 0.5); // Stars grow slightly when cursor is near
            ctx.beginPath();
            ctx.fillStyle = star.color.replace('OPACITY', finalOpacity);
            ctx.arc(finalX, finalY, starSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
}

// Create individual star data object
function createStar() {
    // Random position in percentages (for responsive positioning)
    const xPercent = Math.random() * 100;
    const yPercent = Math.random() * 100;
    
    // Convert percentage to actual pixels
    const x = xPercent * window.innerWidth / 100;
    const y = yPercent * window.innerHeight / 100;
    
    // Random size (Nexus 4 style has varying subtle sizes)
    const size = Math.random() * 2 + 0.5; // 0.5-2.5px
    
    // Random max opacity
    const maxOpacity = Math.random() * 0.5 + 0.3; // 0.3-0.8
    
    // Random twinkle speed - increased variation for more natural effect
    const twinkleSpeed = 0.005 + Math.random() * 0.03; // More variation in animation speed (0.005-0.035)
    const twinklePhase = Math.random() * Math.PI * 2; // Random starting phase
    
    // Parallax movement factor (smaller stars move more) - increased for more dramatic effect
    const parallaxFactor = (4 - size) / 15; // Increased parallax effect (was /15)
    
    // Star color (mostly white with some variations)
    let color;
    const colorRnd = Math.random();
    
    if (colorRnd > 0.9) {
        // Slight blue tint
        color = 'rgba(220, 240, 255, OPACITY)';
    } else if (colorRnd > 0.8) {
        // Slight warm tint
        color = 'rgba(255, 240, 230, OPACITY)';
    } else {
        // White
        color = 'rgba(255, 255, 255, OPACITY)';
    }
    
    return {
        x, y, 
        xPercent, yPercent,
        size, 
        maxOpacity,
        twinkleSpeed,
        twinklePhase,
        parallaxFactor,
        color
    };
  }