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
                document.querySelector('.add-text').style.color = '#0099cc'; // Reset color if less than 8 items
                document.querySelector('.add-todo-btn .material-icons').style.color = '#0099cc'; // Reset icon color if less than 8 items
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
        document.getElementById('showAddTodo').style.opacity = '0.3'; // Set opacity to 0.5 if 8 or more items
        document.querySelector('.add-text').style.color = '#FFFFFF'; // Change color to white if 8 or more items
        document.querySelector('.add-todo-btn .material-icons').style.color = '#FFFFFF'; // Change icon color to white if 8 or more items
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

    // Function to fetch random images from Unsplash
    async function fetchRandomImages() {
        const accessKey = 'HSd9xcrbkWd-a66e8bZWfqJKxCSovnX9U7hYNHOzx1E'; // Your actual access key
        const images = [];
        
        // Fetch 24 images (can be done in parallel to speed up)
        const fetchPromises = [];
        for (let i = 0; i < 24; i++) {
            fetchPromises.push(
                fetch(`https://api.unsplash.com/photos/random?client_id=${accessKey}&query=textures&orientation=landscape&order_by=popular`)
                    .then(response => response.json())
                    .then(data => data.urls.regular)
            );
        }
        
        try {
            const results = await Promise.all(fetchPromises);
            return results;
        } catch (error) {
            console.error('Error fetching images:', error);
            return []; // Return empty array if fetching fails
        }
    }

    // Function to check if we need to refresh the cache
    async function getImageCache() {
        return new Promise((resolve) => {
            // Check if chrome.storage is available
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['imageCache', 'lastCacheTime'], function(result) {
                    const now = new Date().getTime();
                    const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                    
                    // If cache doesn't exist or is older than 24 hours
                    if (!result.imageCache || !result.lastCacheTime || (now - result.lastCacheTime > oneDayMs)) {
                        console.log('Refreshing image cache');
                        
                        // Fetch new images
                        fetchRandomImages().then(images => {
                            // Save to cache
                            chrome.storage.local.set({ 
                                imageCache: images,
                                lastCacheTime: now
                            }, function() {
                                console.log('Image cache refreshed with', images.length, 'images');
                                resolve(images);
                            });
                        });
                    } else {
                        console.log('Using existing image cache of', result.imageCache.length, 'images');
                        resolve(result.imageCache);
                    }
                });
            } else {
                // Fallback to localStorage if chrome.storage is not available
                const cachedData = localStorage.getItem('imageCache');
                const lastCacheTime = localStorage.getItem('lastCacheTime');
                const now = new Date().getTime();
                const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                
                if (!cachedData || !lastCacheTime || (now - parseInt(lastCacheTime) > oneDayMs)) {
                    console.log('Refreshing image cache (localStorage)');
                    
                    // Fetch new images
                    fetchRandomImages().then(images => {
                        // Save to cache
                        localStorage.setItem('imageCache', JSON.stringify(images));
                        localStorage.setItem('lastCacheTime', now.toString());
                        console.log('Image cache refreshed with', images.length, 'images');
                        resolve(images);
                    });
                } else {
                    console.log('Using existing image cache (localStorage)');
                    const images = JSON.parse(cachedData);
                    resolve(images);
                }
            }
        });
    }

    // Function to get a random image from the cache
    async function getRandomImage() {
        const imageCache = await getImageCache();
        
        // If cache is empty (which shouldn't happen, but just in case)
        if (!imageCache || imageCache.length === 0) {
            console.error('Image cache is empty');
            return null;
        }
        
        // Select random image from cache
        const randomIndex = Math.floor(Math.random() * imageCache.length);
        return imageCache[randomIndex];
    }

    // Function to set the background image
    async function setBackgroundImage() {
        try {
            const imageUrl = await getRandomImage();
            if (imageUrl) {
                // Remove the 'loaded' class first to reset the animation
                document.body.classList.remove('loaded');
                
                // Set the background image
                document.body.style.backgroundImage = `url(${imageUrl})`;
                
                // Force a reflow to ensure the animation resets
                void document.body.offsetWidth;
                
                // Add the 'loaded' class to trigger the zoom-in animation
                document.body.classList.add('loaded');
            }
        } catch (error) {
            console.error('Error setting background image:', error);
        }
    }

    // Function to clear the image cache
    function clearImageCache() {
        console.log('Clearing image cache...');
        
        // Check if chrome.storage is available
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.remove(['imageCache', 'lastCacheTime'], function() {
                console.log('Image cache cleared from chrome.storage.local');
                // Reload the background image
                setBackgroundImage();
            });
        } else {
            // Fallback to localStorage if chrome.storage is not available
            localStorage.removeItem('imageCache');
            localStorage.removeItem('lastCacheTime');
            console.log('Image cache cleared from localStorage');
            // Reload the background image
            setBackgroundImage();
        }
    }

    // Expose the clearImageCache function to the global scope
    window.clearImageCache = clearImageCache;

    // Call the function when the page loads
    setBackgroundImage();
});