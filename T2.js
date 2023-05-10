// 1st Way
document.addEventListener("click", function(e) {
    if (e.target.className.indexOf("bottom-bar__close") !== -1) {
      document.body.removeChild(e.target.parentElement.parentElement);
  
      // Showcase .remove(); (not supported in IE)
    }
  });
  
  // 2nd way
  // document.addEventListener("click", function(e) {
  //   if (e.target.getAttribute("data-bottombar-close") !== null) {
  //     const bottomBarName = e.target.getAttribute("data-bottombar-close");
  //     document.body.removeChild(
  //       document.body.querySelector(
  //         ".bottom-bar[data-bottombar='" + bottomBarName + "']"
  //       )
  //     );
  //   }
  // });
  