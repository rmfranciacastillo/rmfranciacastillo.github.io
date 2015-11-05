
    var doc=document.getElementById("demo");
    function getLocation()
    {
        if (navigator.geolocation)
        {
        navigator.geolocation.getCurrentPosition(showPosition,showError);
        }
    }

    function showPosition(position)
    {
        var latlon=position.coords.latitude+","+position.coords.longitude;

        var img_url="http://maps.googleapis.com/maps/api/staticmap?center="
        +latlon+"&zoom=14&size=400x300&sensor=false";
        document.getElementById("map").innerHTML="<img src='"+img_url+"'>";
    }

    function showError(error)
    {
        switch(error.code) 
        {
        case error.PERMISSION_DENIED:
          doc.innerHTML="Request for Geolocation denied by the user."
          break;
        case error.POSITION_UNAVAILABLE:
          doc.innerHTML="Unavailable location information."
          break;
        case error.TIMEOUT:
          doc.innerHTML="Location request timed out."
          break;
        case error.UNKNOWN_ERROR:
          doc.innerHTML="UNKNOWN_ERROR."
          break;
        }
    }
