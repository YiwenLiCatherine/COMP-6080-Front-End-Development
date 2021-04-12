function changePage(oldPage, newPage){
    document.getElementById(oldPage).style.display = 'none';
    document.getElementById(newPage).style.display = 'block';
}

function errorPopup(error_content){
    document.getElementById('errorPopupForm').style.display = 'block';
    document.getElementById('errorPopupContent').innerText = error_content;
}

function timeConvert(t) {
    let time = new Date(t * 1000);
    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let day = time.getDate();
    let hms = time.toTimeString().substr(0, 8);
    return `${year}-${month}-${day} ${hms}`;
}

// shadow push... nothing changed :(
function idsToUsernames(listOfId){
    let listOfName = new Array();
    listOfId.map((ID) => {
        const result = fetch(`http://localhost:5000/user/?id=${ID}`, {
            method: 'Get',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + localStorage.getItem('MyToken'),
            },
        }).then((data) => {
            if (data.status === 200){
                data.json().then((data) => {
                    listOfName.push(data.username)
                });
            }
        });
    });
    return listOfName;
}

document.getElementById('loginSubmitButton').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;
    if(password1 !== password2){
        errorPopup('Passwords do not match!')
    } else {
        const loginBody = {
            "username": username,
            "password": password1,
        };
        const result = fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginBody),
        }).then((data) => {
            if(data.status === 403){
                errorPopup('Invalid Username/Password!')
            } else if(data.status === 400){
                errorPopup('Missing Username/Password!')
            } else if(data.status === 200){
                data.json().then(result => {
                    localStorage.setItem('MyToken', result.token);
                    localStorage.setItem('MyUsername', username);
                    changePage('loginForm', 'mybasicFeed')
                    loadUserInf(username, 'myuserInfOnFeed')
                    myloadFeed()
                })
            }
        }).catch(() => {
            errorPopup('Error!:(');
        });
    }
});

document.getElementById('registerFormButton').addEventListener('click', () => {
    changePage('loginForm', 'registerForm')
});

document.getElementById('registerButton').addEventListener('click', () => {
    const username = document.getElementById('registerUsername').value;
    const password1 = document.getElementById('registerPassword1').value;
    const password2 = document.getElementById('registerPassword2').value;
    const emailAddress = document.getElementById('registerEmailAddress').value;
    const name = document.getElementById('registerName').value;
    if(password1 !== password2){
        errorPopup('Passwords do not match!')
    } else {
        const registerBody = {
            "username": username,
            "password": password1,
            "email": emailAddress,
            "name": name
        };
        const result = fetch('http://localhost:5000/auth/signup', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerBody),
        }).then((data) => {
            if(data.status === 409){
                errorPopup('Username Taken!')
            } else if(data.status === 400){
                errorPopup('Missing Username/Password!')
            } else if(data.status === 200){
                data.json().then(result => {
                    //document.getElementById('token').innerText = result.token;
                    changePage('registerForm', 'registerSuccess')
                    document.getElementById('registerUserInf').innerText = "Your username is: " + username;
                })
            }
        }).catch(() => {
            errorPopup('Error!:(');
        });
    }
});

document.getElementById('registerToLogin').addEventListener('click', () => {
    changePage('registerSuccess', 'loginForm')
});

document.getElementById('errorPopupFromClose').addEventListener('click', () => {
    document.getElementById('errorPopupForm').style.display = 'none';
});

const myloadFeed = () => {
    let p = 0;
    let n = 10;
    const result = fetch(`http://localhost:5000/user/feed?p=${p}&n=${n}`, {
        method: 'Get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + localStorage.getItem('MyToken'),
        },
    }).then((data) => {
        if(data.status === 403){
            errorPopup('Invalid Auth Token!')
        } else if(data.status === 200){
            data.json().then(data => {
                const posts = data['posts'];
                posts.map(post => {
                    const feedBox = document.createElement('div');
                    feedBox.className = 'feedBoxStyle';
                    const postId = post.id;
                    feedBox.setAttribute('id', `myfeedBox${postId}`);

                    //author
                    const authorElement = document.createElement('div');
                    authorElement.innerText = post.meta.author;
                    authorElement.className = 'authorBoxStyle';
                    authorElement.setAttribute('id', `myauthorElement${postId}`);
                    feedBox.appendChild(authorElement);

                    //image
                    const imgElement = document.createElement('img');
                    imgElement.setAttribute('src', `data:image/jpeg;base64,${post.thumbnail}`);
                    feedBox.appendChild(imgElement);

                    //description
                    const descElement = document.createElement('div');
                    descElement.innerText = post.meta.description_text;
                    feedBox.appendChild(descElement);

                    //heart
                    const heartElement = document.createElement('div');
                    heartElement.innerText = `🤍`;
                    heartElement.className = 'likesBoxStyle';
                    heartElement.setAttribute('id', `myheartElement${postId}`);

                    //how many likes
                    const likesElement = document.createElement('div');
                    likesElement.innerText = `${post.meta.likes.length}  `;
                    likesElement.className = 'likesBoxStyle';
                    likesElement.setAttribute('id', `mylikesElement${postId}`);

                    //comment icon
                    const commentIcon = document.createElement('div');
                    commentIcon.innerText = `📝`;
                    commentIcon.className = 'likesBoxStyle';

                    //how many comments
                    const commElement = document.createElement('div');
                    commElement.innerText = `${post.comments.length}  `;
                    commElement.className = 'likesBoxStyle';
                    commElement.setAttribute('id', `mycommElement${postId}`);

                    const likeAndComm = document.createElement('div');
                    likeAndComm.className = 'LeftStyle';
                    likeAndComm.appendChild(heartElement);
                    likeAndComm.appendChild(likesElement);
                    likeAndComm.appendChild(commentIcon);
                    likeAndComm.appendChild(commElement);
                    feedBox.appendChild(likeAndComm);

                    //time
                    const timeElement = document.createElement('div');
                    timeElement.innerText = timeConvert(post.meta.published);
                    timeElement.className = 'timeStyle';
                    feedBox.appendChild(timeElement);

                    const myuserBasicFeed = document.getElementById('myuserBasicFeed');
                    myuserBasicFeed.appendChild(feedBox);

                    // Show Likes list
                    document.getElementById(`mylikesElement${postId}`).addEventListener('click', () => {
                        changePage('mybasicFeed', 'showListOfLikes')
                        if(post.meta.likes.length === 0){
                            document.getElementById('showListOfLikesContent').innerText = 'No user likes this post yet :(';
                        } else{
                            document.getElementById('showListOfLikesContent').innerText = `A list of all users who have liked this post(userId): ${post.meta.likes}`;
                        }
                    });
                    document.getElementById('likesToFeed').addEventListener('click', () => {
                        changePage('showListOfLikes', 'mybasicFeed')
                    });

                    // Show Comments list
                    document.getElementById(`mycommElement${postId}`).addEventListener('click', () => {
                        changePage('mybasicFeed', 'showComments')
                        if(post.comments.length === 0){
                            document.getElementById('showCommentContent').innerText = 'This post does not have comments yet :(';
                        } else{
                            document.getElementById('showCommentContent').innerText = `A list of comments of this post(userId): ${post.comments}`;
                        }
                    });
                    document.getElementById('commentsToFeed').addEventListener('click', () => {
                        changePage('showComments', 'mybasicFeed')
                    });

                    // Ability for you to like content
                    document.getElementById(`myheartElement${postId}`).addEventListener('click', () => {
                        if (document.getElementById(`myheartElement${postId}`).innerText === `🤍`){
                            likePostContent(postId)
                        } else {
                            unlikePostContent(postId)
                        }
                    });

                    // Profile View
                    document.getElementById(`myauthorElement${postId}`).addEventListener('click', () => {
                        const authorName = document.getElementById(`myauthorElement${postId}`).innerText;
                        changePage('mybasicFeed', 'basicFeed')
                        document.getElementById('userInfOnFeed').innerText = '';
                        loadUserInf(authorName, 'userInfOnFeed')
                        document.getElementById('userBasicFeed').innerText = '';
                        loadFeed(authorName)
                    });


                });
            });
        }
    }).catch((error)=>{
        errorPopup(`Error: ${error}`)
    })
};

const likePostContent = (postId) => {
    const result = fetch(`http://localhost:5000/post/like?id=${postId}`, {
        method: 'Put',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + localStorage.getItem('MyToken'),
        },
    }).then((data) => {
        if (data.status === 400) {
            errorPopup('Malformed Request!')
        } else if (data.status === 403) {
            errorPopup('Invalid Auth Token!')
        } else if (data.status === 404) {
            errorPopup('Post Not Found!')
        } else if (data.status === 200) {
            document.getElementById(`myheartElement${postId}`).innerText = '❤️';
            if (document.getElementById(`heartElement${postId}`)){
                document.getElementById(`heartElement${postId}`).innerText = '❤️';
            }
        }
    });
};

const unlikePostContent = (postId) => {
    const result = fetch(`http://localhost:5000/post/unlike?id=${postId}`, {
        method: 'Put',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + localStorage.getItem('MyToken'),
        },
    }).then((data) => {
        if (data.status === 400) {
            errorPopup('Malformed Request!')
        } else if (data.status === 403) {
            errorPopup('Invalid Auth Token!')
        } else if (data.status === 404) {
            errorPopup('Post Not Found!')
        } else if (data.status === 200) {
            document.getElementById(`myheartElement${postId}`).innerText = '🤍';
            if (document.getElementById(`heartElement${postId}`)){
                document.getElementById(`heartElement${postId}`).innerText = '🤍';
            }
        }
    });
};

const loadUserInf = (user, changeBoxName) => {
    const result = fetch(`http://localhost:5000/user/?username=${user}`, {
        method: 'Get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + localStorage.getItem('MyToken'),
        },
    }).then((data) => {
        if (data.status === 400) {
            errorPopup('Malformed Request!')
        } else if (data.status === 403) {
            errorPopup('Invalid Auth Token!')
        } else if (data.status === 404) {
            errorPopup('User Not Found!')
        } else if (data.status === 200) {
            data.json().then(data => {
                const userId = data.id;
                const userName = data.username;
                const userEmail = data.email;
                const userNickname = data.name;
                const userPost = data.posts.length;
                const userFollowing = data.following.length;
                const userFollowed_num = data.followed_num;

                const userInfOnFeed = document.getElementById(changeBoxName);

                //UserName
                const userNameElement = document.createElement('div');
                userNameElement.innerText = userName;
                userNameElement.className = 'userNameElementStyle';
                userInfOnFeed.appendChild(userNameElement);

                //NickName
                const userNicknameElement = document.createElement('div');
                userNicknameElement.innerText = `Name: ${userNickname}`;
                userInfOnFeed.appendChild(userNicknameElement);

                //UserEmail
                const userEmailElement = document.createElement('div');
                userEmailElement.innerText = `Email: ${userEmail}`;
                userInfOnFeed.appendChild(userEmailElement);

                //Post and Follower
                const postAndFollowElement = document.createElement('div');
                const postElement = document.createElement('div');
                const followingElement = document.createElement('div');
                const followedElement = document.createElement('div');

                postAndFollowElement.appendChild(postElement);
                postAndFollowElement.appendChild(followingElement);
                postAndFollowElement.appendChild(followedElement);

                postElement.innerText = `${userPost} Posts`;
                followingElement.innerText = `${userFollowing} Following`;
                followedElement.innerText = `${userFollowed_num} Followers`;
                postAndFollowElement.className = 'postAndFollowElementStyle';
                postElement.className = 'inlineBlock';
                followingElement.className = 'inlineBlock';
                followedElement.className = 'inlineBlock';
                userInfOnFeed.appendChild(postAndFollowElement);

                followingElement.setAttribute('id', `followingElement${userId}`);
                document.getElementById(`followingElement${userId}`).addEventListener('click', () => {
                    changePage('mybasicFeed', 'list_of_following');
                    if (data.following.length === 0){
                        document.getElementById('ListOfFollowingContent').innerText = 'You are not following anyone :(';
                    } else {
                        document.getElementById('ListOfFollowingContent').innerText = `You are following ${data.following}`;
                    }
                });
                document.getElementById('followingToFeed').addEventListener('click', () => {
                    changePage('list_of_following', 'mybasicFeed')
                });
                if (document.getElementById('followButton')){
                    document.getElementById('followButton').addEventListener('click', () => {
                        if (document.getElementById('followButton').innerText === 'follow'){
                            followUser(userName)
                        } else {
                            unfollowUser(userName)
                        }
                    });
                }

            });
        }
    });
}

const loadFeed = (aName) => {
    let p = 0;
    let n = 10;
    const result = fetch(`http://localhost:5000/user/feed?p=${p}&n=${n}`, {
        method: 'Get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + localStorage.getItem('MyToken'),
        },
    }).then((data) => {
        if(data.status === 403){
            errorPopup('Invalid Auth Token!')
        } else if(data.status === 200){
            data.json().then(data => {
                const posts = data['posts'];
                posts.map(post => {
                    if (aName === post.meta.author){
                        const feedBox = document.createElement('div');
                        feedBox.className = 'feedBoxStyle';
                        const postId = post.id;
                        feedBox.setAttribute('id', `feedBox${postId}`);

                        //author
                        const authorElement = document.createElement('div');
                        authorElement.innerText = post.meta.author;
                        authorElement.className = 'authorBoxStyle';
                        authorElement.setAttribute('id', `authorElement${postId}`);
                        feedBox.appendChild(authorElement);

                        //image
                        const imgElement = document.createElement('img');
                        imgElement.setAttribute('src', `data:image/jpeg;base64,${post.thumbnail}`);
                        feedBox.appendChild(imgElement);

                        //description
                        const descElement = document.createElement('div');
                        descElement.innerText = post.meta.description_text;
                        feedBox.appendChild(descElement);

                        //heart
                        const heartElement = document.createElement('div');
                        heartElement.innerText = `🤍`;
                        heartElement.className = 'likesBoxStyle';
                        heartElement.setAttribute('id', `heartElement${postId}`);

                        //how many likes
                        const likesElement = document.createElement('div');
                        likesElement.innerText = `${post.meta.likes.length}  `;
                        likesElement.className = 'likesBoxStyle';
                        likesElement.setAttribute('id', `likesElement${postId}`);

                        //comment icon
                        const commentIcon = document.createElement('div');
                        commentIcon.innerText = `📝`;
                        commentIcon.className = 'likesBoxStyle';

                        //how many comments
                        const commElement = document.createElement('div');
                        commElement.innerText = `${post.comments.length}  `;
                        commElement.className = 'likesBoxStyle';
                        commElement.setAttribute('id', `commElement${postId}`);

                        const likeAndComm = document.createElement('div');
                        likeAndComm.className = 'LeftStyle';
                        likeAndComm.appendChild(heartElement);
                        likeAndComm.appendChild(likesElement);
                        likeAndComm.appendChild(commentIcon);
                        likeAndComm.appendChild(commElement);
                        feedBox.appendChild(likeAndComm);

                        //time
                        const timeElement = document.createElement('div');
                        timeElement.innerText = timeConvert(post.meta.published);
                        timeElement.className = 'timeStyle';
                        feedBox.appendChild(timeElement);

                        const userBasicFeed = document.getElementById('userBasicFeed');
                        userBasicFeed.appendChild(feedBox);

                        // Show Likes
                        document.getElementById(`likesElement${postId}`).addEventListener('click', () => {
                            changePage('basicFeed', 'showListOfLikes')
                            if(post.meta.likes.length === 0){
                                document.getElementById('showListOfLikesContent').innerText = 'No user likes this post yet :(';
                            } else{
                                document.getElementById('showListOfLikesContent').innerText = `A list of all users who have liked this post(userId): ${post.meta.likes}`;
                            }
                        });
                        document.getElementById('likesToFeed').addEventListener('click', () => {
                            changePage('showListOfLikes', 'basicFeed')
                        });

                        // Show Comments
                        document.getElementById(`commElement${postId}`).addEventListener('click', () => {
                            changePage('basicFeed', 'showComments')
                            if(post.comments.length === 0){
                                document.getElementById('showCommentContent').innerText = 'This post does not have comments yet :(';
                            } else{
                                document.getElementById('showCommentContent').innerText = `A list of comments of this post(userId): ${post.comments}`;
                            }
                        });
                        document.getElementById('commentsToFeed').addEventListener('click', () => {
                            changePage('showComments', 'basicFeed')
                        });

                        // Ability for you to like content
                        document.getElementById(`heartElement${postId}`).addEventListener('click', () => {
                            if (heartElement.innerText === `🤍`){
                                likePostContent(postId)
                            } else {
                                unlikePostContent(postId)
                            }
                        });

                        // return to original my basic feed
                        document.getElementById('returnToMybasicFeed').addEventListener('click', () => {
                            changePage('basicFeed', 'mybasicFeed')
                        });
                    }
                });
            });
        }
    }).catch((error)=>{
        errorPopup(`Error: ${error}`)
    })
};

const followUser = (username) => {
    const result = fetch(`http://localhost:5000/user/follow?username=${username}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + localStorage.getItem('MyToken'),
        },
    }).then((data) => {
        if (data.status === 400) {
            errorPopup('Malformed Request!')
        } else if (data.status === 403) {
            errorPopup('Invalid Auth Token!')
        } else if (data.status === 404) {
            errorPopup('Post Not Found!')
        } else if (data.status === 200) {
            document.getElementById('followButton').innerText = 'unfollow';
        }
    });
};

const unfollowUser = (username) => {
    const result = fetch(`http://localhost:5000/user/unfollow?username=${username}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + localStorage.getItem('MyToken'),
        },
    }).then((data) => {
        if (data.status === 400) {
            errorPopup('Unfollow Malformed Request!')
        } else if (data.status === 403) {
            errorPopup('Invalid Auth Token!')
        } else if (data.status === 404) {
            errorPopup('Post Not Found!')
        } else if (data.status === 200) {
            document.getElementById('followButton').innerText = 'follow';
        }
    });
};