'use strict';
angular.module('App', ['ngMaterial', 'ui.router', 'ngResource'])

//configuration des view par rapport au chemines
  .config(function ($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'public/views/home.html',
      controller: 'ProductsController',
    })
    .state('cart', {
      url: '/cart',
      templateUrl: 'public/views/cart.html',
      controller: 'CartController',
    })
    .state('checkout', {
      url: '/checkout',
      templateUrl: 'public/views/checkout.html',
      controller: 'CheckoutController',
    })
    ;

})

//les controlleurs
.controller('ItemsListController', function($scope, $resource,CategoryService,SearchService, ProductsService){
  
  $scope.$watch(CategoryService.getFilter, function(oldValue, newValue){
      $scope.items = ProductsService.query();
  });

  $scope.$watch(SearchService.getSearch, function(oldValue, newValue){
      $scope.items = ProductsService.query();
  });
})

.controller('HeaderController', function($scope, CartService){
  $scope.$watch(CartService.get, function(oldValue, newValue){
      console.log('changed');
      $scope.cartCount = CartService.get().length;
  }, true);


})

.controller('ProductsController', function($scope, $anchorScroll, $location, PathService, CartService, NotificationService){
  PathService
    .clear()
    .add('Home', '')
    .add('His', '')
  $scope.optionsHidden = false;

  $scope.toggleHideOptions = function(){
    $scope.optionsHidden = !$scope.optionsHidden;
  };

  $scope.addToCart = function(item){
    CartService.add(item);
    NotificationService.simpleToast("'" + item.description + "''" + ' was added to your cart.');
  }

})

.controller('CheckoutController', function($scope, PathService,LoginService,NotificationService){
  PathService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('Checkout', '/checkout');
  $scope.email = '';
  $scope.password = '';
  $scope.login = function(){
    var res = LoginService.login($scope.email, $scope.password);
    if(res){
      NotificationService.simpleToast('Welcome ' + $scope.email + ' !');
    } else {
      NotificationService.simpleToast('Wrong login/password');
    }
  };
})

.controller('CartController', function($scope, PathService, CartService){
  PathService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('Cart', '');

  $scope.items = CartService.get();

  $scope.remove = function(itemName){
    $scope.items = CartService.remove(itemName).get();
  };

})

.controller('PresentationCtrl', function($scope){

})

.controller('PathController', function($scope, PathService){
  $scope.add = PathService.add;
  $scope.remove = PathService.remove;
  $scope.locations = PathService.get();

})

.controller('CategoriesController',function($scope, CategoryService,filterFilter){
  $scope.categories = CategoryService.query();
  $scope.selectCategory = function(categoryName){
   var tmp = filterFilter($scope.categories,{selected : true});
   if(tmp.length>0){
          tmp[0].selected=false;
   }
   if(categoryName){
        filterFilter($scope.categories,{name : categoryName})[0].selected=true;
   }
    CategoryService.setFilter(categoryName, $scope);
  };
})


//les services
.service('PathService', function(){
  var locations = [];

  return {
    add: function(name, url){
      locations.push({name: name, url: url});
      return this;
    },
    remove: function(){
      locations.pop();
      return this;
    },
    get: function(){
      return locations;
    },
    clear: function(){
      locations = [];
      return this;
    }
  };
})

.service('LoginService', function($resource){

  return {
    
    login: function(email, password){
        return ((email==="nait@gmail.com") && (password==="password"));
      }
    };
  })

.service('ProductsService', function($resource, $filter, CategoryService, SearchService){
  var Item = $resource('resources/products.json');
  var items = Item.query();

  return {
    query: function(){
      var res = items;
      var categoryName = CategoryService.getFilter();
      var search = SearchService.getSearch();

      if(categoryName){
        res = res.filter(function(item){
          return item.categories === categoryName;
        });
      }

      if(search){
        res = res.filter(function(item){
          return (item.description.indexOf(search) >= 0) ||
          (item.description.indexOf(search) >= 0);
        });
      }

      return res;
    }
  };
})


.service('CartService', function(){
  var items = [];

  function indexOfItem(name){
    var i = 0;
    while(i< items.length){
      if(items[i].description === name){
        return i;
      }
      i += 1;
    }
    return -1;
  }

  return {
    add: function(item, quantity){
      quantity = quantity || 1;
      item.quantity = quantity;


      var index = indexOfItem(item.description);
      console.log(index);


      if(index >= 0){
        items[index].quantity += quantity;
      } else {
        items.push(item);
      }


      return this;
    },
    remove: function(itemName){
      items = items.filter(function(item){
        return item.description !== itemName;
      });
       
      return this;
    },
    clear: function(){
      items = [];
      return this;
    },
    get: function(){
      return items;
    }
  };
})

.service('NotificationService', function($mdToast){
  return {
    simpleToast: function(msg){
      $mdToast.show(
        $mdToast.simple()
          .content(msg)
          .position('fit bottom right')
          .hideDelay(3000)
      );
    }
  };
})

.service('CategoryService', function($resource){
  var Category = $resource('resources/categories.json');
  var filter = '';

  return {
    query: function(){
      return Category.query();
    },
    getFilter: function(){
      return filter;
    },
    setFilter: function(newFilter){
      filter = newFilter;
    }
  };
})

.service('SearchService', function(){
  var search = '';

  return {
    getSearch: function(){
      return search;
    },
    setSearch: function(newSearch){
      search = newSearch;
    }
  };
})
;
