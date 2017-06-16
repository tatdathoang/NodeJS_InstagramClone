//onLoad function, to be executed when page is completed loaded by browser
function onload(){
    //start a promise chain
    Promise.resolve()
    .then(function(){
        //jQuery function to request all the posts from the server
        //the 'return' is required. Otherwise, the subsequent then will not wait for this to complete
        console.log($.post('GetAllComments'));
        return $.post('GetAllPosts');  
    })
    //when the server responds, we'll execute this code
    .then(function(posts){
        //jQuery function to set the innerHTML of the div with id = 'posts' to empty
       // $('#feed-container').empty();
        //loop over each post item in the posts array
        posts.forEach(function(post){
            //jQuery function to append to the innterHTML of the div with id = 'posts'
            Promise.resolve()
            .then(function(){
                //jQuery function to request all the posts from the server
                //the 'return' is required. Otherwise, the subsequent then will not wait for this to complete
                console.log(post._id)
                return ($.post('GetAllComments',post._id));
            })
            //when the server responds, we'll execute this code
            .then(function(posts){
        
              var feedBlockTemplate = "";
              $('#feed-container').append(
                '<div class="feed-block" data-postId="' + post._id + '">' +
                '  <div class="feed-header">' +
                '    <a href="" class="feed-avatar">' +
                '      <img src="{post-image}" class="feed-avatar-image small"></img>' +
                '    </a>' +
                '    <div class="feed-info">' +
                '      <a class="feed-user" href="">"' +
                '        {post-user}' +
                '      </a>' +
                '    </div>' +
                '    <a href="" class="feed-time">' +
                '      <time>' + post.datePosted + '</time>' +
                '    </a>' +
                '  </div>' +
                '  <a href="" class="feed-image">' +
                '    <img src="'+ post.imageURL +'" class="img-responsive" alt="">' +
                '  </a>' +
                '  <div class="feed-body">' +
                '    <p class="likes">'+ post.likeCount +'</p>' +
                '    <ul class="comment-list">' +
                '      <li>' +
                '        <a class="feed-user" href="">' +
                '          chiletravel' +
                '        </a>' + post.caption + '</li></ul>' +
                '    <div class="add-comment">' +
                '      <a class="fa fa-heart-o like-photo"></a>' +
                '      <form class="add-comment-form">' +
                '        <input type="text" placeholder="Add a comment..." class="add-comment-input" name=""/>' +
                '      </form>' +
                '    </div>' +
                '  </div>' +
                '</div>' 
              );
            });
        });
    })
    .catch(function(err){
        //always include a catch for exceptions
        console.log(err);
    });
}