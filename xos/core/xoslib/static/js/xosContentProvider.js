"use strict";angular.module("xos.contentProvider",["ngResource","ngCookies","ngLodash","xos.helpers","ui.router","xos.xos"]).config(["$stateProvider","$urlRouterProvider",function(n,e){n.state("list",{url:"/",template:"<content-provider-list></content-provider-list>"}).state("details",{url:"/contentProvider/:id",template:"<content-provider-detail></content-provider-detail>"}).state("cdn",{url:"/contentProvider/:id/cdn_prefix",template:"<content-provider-cdn></content-provider-cdn>"}).state("server",{url:"/contentProvider/:id/origin_server",template:"<content-provider-server></content-provider-server>"}).state("users",{url:"/contentProvider/:id/users",template:"<content-provider-users></content-provider-users>"})}]).config(["$httpProvider",function(n){n.interceptors.push("SetCSRFToken"),n.interceptors.push("NoHyperlinks")}]).service("ContentProvider",["$resource",function(n){return n("/hpcapi/contentproviders/:id/",{id:"@id"},{update:{method:"PUT"}})}]).service("ServiceProvider",["$resource",function(n){return n("/hpcapi/serviceproviders/:id/",{id:"@id"})}]).service("CdnPrefix",["$resource",function(n){return n("/hpcapi/cdnprefixs/:id/",{id:"@id"})}]).service("OriginServer",["$resource",function(n){return n("/hpcapi/originservers/:id/",{id:"@id"})}]).service("User",["$resource",function(n){return n("/xos/users/:id/",{id:"@id"})}]).directive("cpActions",["ContentProvider","$location",function(n,e){return{restrict:"E",scope:{id:"=id"},bindToController:!0,controllerAs:"vm",templateUrl:"templates/cp_actions.html",controller:function(){this.deleteCp=function(t){n["delete"]({id:t}).$promise.then(function(){e.url("/")})}}}}]).directive("contentProviderList",["ContentProvider","lodash",function(n,e){return{restrict:"E",controllerAs:"vm",scope:{},templateUrl:"templates/cp_list.html",controller:function(){var t=this;n.query().$promise.then(function(n){t.contentProviderList=n})["catch"](function(n){throw new Error(n)}),this.deleteCp=function(s){n["delete"]({id:s}).$promise.then(function(){e.remove(t.contentProviderList,{id:s})})}}}}]).directive("contentProviderDetail",["ContentProvider","ServiceProvider","$stateParams","$location",function(n,e,t,s){return{restrict:"E",controllerAs:"vm",scope:{},templateUrl:"templates/cp_detail.html",controller:function(){this.pageName="detail";var i=this;t.id?n.get({id:t.id}).$promise.then(function(n){i.cp=n})["catch"](function(n){i.result={status:0,msg:n.data.detail}}):i.cp=new n,e.query().$promise.then(function(n){i.sp=n}),this.saveContentProvider=function(n){var e,t=!1;n.id?e=n.$update():(t=!0,n.name=n.humanReadableName,e=n.$save()),e.then(function(n){i.result={status:1,msg:"Content Provider Saved"},t&&s.url("contentProvider/"+n.id+"/")})["catch"](function(n){i.result={status:0,msg:n.data.detail}})}}}}]).directive("contentProviderCdn",["$stateParams","CdnPrefix","ContentProvider","lodash",function(n,e,t,s){return{restrict:"E",controllerAs:"vm",scope:{},templateUrl:"templates/cp_cdn_prefix.html",controller:function(){var i=this;this.pageName="cdn",n.id&&t.get({id:n.id}).$promise.then(function(n){i.cp=n})["catch"](function(n){i.result={status:0,msg:n.data.detail}}),e.query().$promise.then(function(e){i.prf=e,i.cp_prf=s.where(e,{contentProvider:parseInt(n.id)})})["catch"](function(n){i.result={status:0,msg:n.data.detail}}),this.addPrefix=function(t){t.contentProvider=n.id;var s=new e(t);s.$save().then(function(n){i.cp_prf.push(n)})["catch"](function(n){i.result={status:0,msg:n.data.detail}})},this.removePrefix=function(n){n.$delete().then(function(){s.remove(i.cp_prf,n)})["catch"](function(n){i.result={status:0,msg:n.data.detail}})}}}}]).directive("contentProviderServer",["$stateParams","OriginServer","ContentProvider","lodash",function(n,e,t,s){return{restrict:"E",controllerAs:"vm",scope:{},templateUrl:"templates/cp_origin_server.html",controller:function(){this.pageName="server",this.protocols={http:"HTTP",rtmp:"RTMP",rtp:"RTP",shout:"SHOUTcast"};var i=this;n.id&&t.get({id:n.id}).$promise.then(function(n){i.cp=n})["catch"](function(n){i.result={status:0,msg:n.data.detail}}),e.query({contentProvider:n.id}).$promise.then(function(n){i.cp_os=n})["catch"](function(n){i.result={status:0,msg:n.data.detail}}),this.addOrigin=function(t){t.contentProvider=n.id;var s=new e(t);s.$save().then(function(n){i.cp_os.push(n)})["catch"](function(n){i.result={status:0,msg:n.data.detail}})},this.removeOrigin=function(n){n.$delete().then(function(){s.remove(i.cp_os,n)})["catch"](function(n){i.result={status:0,msg:n.data.detail}})}}}}]).directive("contentProviderUsers",["$stateParams","ContentProvider","User","lodash",function(n,e,t,s){return{restrict:"E",controllerAs:"vm",scope:{},templateUrl:"templates/cp_user.html",controller:function(){var i=this;this.pageName="user",this.cp_users=[],n.id&&t.query().$promise.then(function(t){return i.users=t,e.get({id:n.id}).$promise}).then(function(n){return n.users=i.populateUser(n.users,i.users),n}).then(function(n){i.cp=n})["catch"](function(n){i.result={status:0,msg:n.data.detail}}),this.populateUser=function(n,e){for(var t=0;t<n.length;t++)n[t]=s.find(e,{id:n[t]});return n},this.addUserToCp=function(n){i.cp.users.push(n)},this.removeUserFromCp=function(n){s.remove(i.cp.users,n)},this.saveContentProvider=function(n){n.users=s.pluck(n.users,"id"),n.$update().then(function(n){i.cp.users=i.populateUser(n.users,i.users),i.result={status:1,msg:"Content Provider Saved"}})["catch"](function(n){i.result={status:0,msg:n.data.detail}})}}}}]),angular.module("xos.contentProvider").run(["$templateCache",function(n){n.put("templates/cp_actions.html",'<a href="#/" class="btn btn-default">\n  <i class="icon icon-arrow-left"></i>Back\n</a>\n<a href="#/contentProvider/" class="btn btn-success">\n  <i class="icon icon-plus"></i>Create\n</a>\n<a ng-click="vm.deleteCp(vm.id)" class="btn btn-danger">\n  <i class="icon icon-remove"></i>Remove\n</a>'),n.put("templates/cp_cdn_prefix.html",'<div class="row-fluid">\n  <div class="span6">\n    <h1>{$ vm.cp.humanReadableName $}</h1>\n  </div>\n  <div class="span6 text-right">\n    <cp-actions id="vm.cp.id"></cp-actions>\n  </div>\n</div>\n<hr>\n<div class="row-fluid">\n  <div class="span2">\n    <div ng-include="\'templates/cp_side_nav.html\'"></div>\n  </div>\n  <div class="span10">\n    <div ng-repeat="item in vm.cp_prf" class="well">\n      <div class="row-fluid">\n        <div class="span4">\n          {{item.humanReadableName}}\n        </div>\n        <div class="span6">\n          <!-- TODO show the name instead that id -->\n          {{item.defaultOriginServer}}\n        </div>\n        <div class="span2">\n          <a ng-click="vm.removePrefix(item)" class="btn btn-danger pull-right">\n            <i class="icon icon-remove"></i>\n          </a>\n        </div>\n      </div>\n    </div>\n    <hr>\n    <form ng-submit="vm.addPrefix(vm.new_prf)">\n      <div class="row-fluid">\n        <div class="span4">\n          <label>Prefix</label>\n          <input type="text" ng-model="vm.new_prf.prefix" required style="max-width: 90%">\n        </div>\n        <div class="span6">\n          <label>Default Origin Server</label>\n          <select ng-model="vm.new_prf.defaultOriginServer" style="max-width: 100%">\n            <option ng-repeat="prf in vm.prf" ng-value="prf.id">{$ prf.humanReadableName $}</option>\n          </select>\n        </div>\n        <div class="span2 text-right">\n          <button class="btn btn-success margin-wells">\n            <i class="icon icon-plus"></i>\n          </button>\n        </div>\n      </div>\n    </form>\n    <div class="alert" ng-show="vm.result" ng-class="{\'alert-success\': vm.result.status === 1,\'alert-error\': vm.result.status === 0}">\n      {$ vm.result.msg $}\n    </div>\n  </div>\n</div>'),n.put("templates/cp_detail.html",'<div class="row-fluid">\n  <div class="span6">\n    <h1>{$ vm.cp.humanReadableName $}</h1>\n  </div>\n  <div class="span6 text-right">\n    <cp-actions id="vm.cp.id"></cp-actions>\n  </div>\n</div>\n<hr>\n<div class="row-fluid">\n  <div ng-show="vm.cp.id" class="span2">\n    <div ng-include="\'templates/cp_side_nav.html\'"></div>\n  </div>\n  <div ng-class="{span10: vm.cp.id, span12: !vm.cp.id}">\n  <!-- TODO hide form on not found -->\n    <form ng-submit="vm.saveContentProvider(vm.cp)">\n      <fieldset>\n        <div class="row-fluid">\n          <div class="span6">\n            <label>Name:</label>\n            <input type="text" ng-model="vm.cp.humanReadableName" required/>\n          </div>\n          <div class="span6">\n            <label class="checkbox">\n              <input type="checkbox" ng-model="vm.cp.enabled" /> Enabled\n            </label>\n          </div>\n        </div>\n        <div class="row-fluid">\n          <div class="span12">\n            <label>Description</label>\n            <textarea style="width: 100%" ng-model="vm.cp.description"></textarea>\n          </div>\n        </div>\n        <div class="row-fluid">\n          <div class="span12">\n            <label>Service provider</label>\n            <select required ng-model="vm.cp.serviceProvider" ng-options="sp.id as sp.humanReadableName for sp in vm.sp"></select>\n          </div>\n        </div>\n        <div class="row-fluid">\n          <div class="span12">\n            <button class="btn btn-success">\n              <span ng-show="vm.cp.id">Save</span>\n              <span ng-show="!vm.cp.id">Create</span>\n            </button>\n          </div>\n        </div>\n      </fieldset>\n    </form>\n    <div class="alert" ng-show="vm.result" ng-class="{\'alert-success\': vm.result.status === 1,\'alert-error\': vm.result.status === 0}">\n      {$ vm.result.msg $}\n    </div>\n  </div>\n</div>'),n.put("templates/cp_list.html",'<table class="table table-striped" ng-show="vm.contentProviderList.length > 0">\n  <thead>\n    <tr>\n      <th>\n        Name\n      </th>\n      <th>Description</th>\n      <th>Status</th>\n      <th></th>\n    </tr>\n  </thead>\n  <tr ng-repeat="item in vm.contentProviderList">\n    <td>\n      <a ui-sref="details({ id: item.id })">{$ item.humanReadableName $}</a>\n    </td>\n    <td>\n      {$ item.description $}\n    </td>\n    <td>\n      {$ item.enabled $}\n    </td>\n    <td class="text-right">\n      <a ng-click="vm.deleteCp(item.id)" class="btn btn-danger"><i class="icon icon-remove"></i></a></td>\n  </tr>\n</table>\n<div class="alert alert-error" ng-show="vm.contentProviderList.length == 0">\n  No Content Provider defined\n</div>\n\n<div class="row">\n  <div class="span12 text-right">\n    <a class="btn btn-success"href="#/contentProvider/">Create</a>\n  </div>\n</div>'),n.put("templates/cp_origin_server.html",'<div class="row-fluid">\n  <div class="span6">\n    <h1>{$ vm.cp.humanReadableName $}</h1>\n  </div>\n  <div class="span6 text-right">\n    <cp-actions id="vm.cp.id"></cp-actions>\n  </div>\n</div>\n<hr>\n<div class="row-fluid">\n  <div class="span2">\n    <div ng-include="\'templates/cp_side_nav.html\'"></div>\n  </div>\n  <div class="span10">\n    <div ng-repeat="item in vm.cp_os" class="well">\n      <div class="row-fluid">\n        <div class="span4">\n          {{item.humanReadableName}}\n        </div>\n        <div class="span6">\n          <!-- TODO shoe the name instead that url -->\n          {{item.defaultOriginServer}}\n        </div>\n        <div class="span2">\n          <a ng-click="vm.removeOrigin(item)" class="btn btn-danger pull-right">\n            <i class="icon icon-remove"></i>\n          </a>\n        </div>\n      </div>\n    </div>\n    <hr>\n    <form ng-submit="vm.addOrigin(vm.new_os)">\n      <div class="row-fluid">\n        <div class="span4">\n          <label>Protocol</label>\n          <select ng-model="vm.new_os.protocol" ng-options="k as v for (k,v) in vm.protocols" style="max-width: 100%;"></select>\n        </div>\n        <div class="span6">\n          <label>Url</label>\n          <input type="text" ng-model="vm.new_os.url" required>\n        </div>\n        <div class="span2 text-right">\n          <button class="btn btn-success margin-wells">\n            <i class="icon icon-plus"></i>\n          </button>\n        </div>\n      </div>\n    </form>\n    <div class="alert" ng-show="vm.result" ng-class="{\'alert-success\': vm.result.status === 1,\'alert-error\': vm.result.status === 0}">\n      {$ vm.result.msg $}\n    </div>\n  </div>\n</div>'),n.put("templates/cp_side_nav.html",'<ul class="nav nav-list">\n  <li>\n    <a class="btn" ng-class="{\'btn-primary\': vm.pageName == \'detail\'}" href="#/contentProvider/{$ vm.cp.id $}">Details</a>\n  </li>\n  <li>\n    <a class="btn" ng-class="{\'btn-primary\': vm.pageName == \'cdn\'}" href="#/contentProvider/{$ vm.cp.id $}/cdn_prefix">Cdn Prexix</a>\n  </li>\n  <li>\n    <a class="btn" ng-class="{\'btn-primary\': vm.pageName == \'server\'}" href="#/contentProvider/{$ vm.cp.id $}/origin_server">Origin Server</a>\n  </li>\n  <li>\n    <a class="btn" ng-class="{\'btn-primary\': vm.pageName == \'user\'}" href="#/contentProvider/{$ vm.cp.id $}/users">Users</a>\n  </li>\n</ul>'),n.put("templates/cp_user.html",'<div class="row-fluid">\n  <div class="span6">\n    <h1>{$ vm.cp.humanReadableName $}</h1>\n  </div>\n  <div class="span6 text-right">\n    <cp-actions id="vm.cp.id"></cp-actions>\n  </div>\n</div>\n<hr>\n<div class="row-fluid">\n  <div class="span2">\n    <div ng-include="\'templates/cp_side_nav.html\'"></div>\n  </div>\n  <div class="span10">\n    <div ng-repeat="item in vm.cp.users" class="well">\n      <div class="row-fluid">\n        <div class="span3">\n          {{item.firstname}}\n        </div>\n        <div class="span3">\n          {{item.lastname}}\n        </div>\n        <div class="span4">\n          {{item.email}}\n        </div>\n        <div class="span2">\n          <a ng-click="vm.removeUserFromCp(item)" class="btn btn-danger pull-right">\n            <i class="icon icon-remove"></i>\n          </a>\n        </div>\n      </div>\n    </div>\n    <hr>\n    <form ng-submit="vm.saveContentProvider(vm.cp)">\n      <div class="row-fluid">\n        <div class="span8">\n          <label>Select user:</label>\n          <select ng-model="vm.user" ng-options="u as u.username for u in vm.users" ng-change="vm.addUserToCp(vm.user)"></select>\n        </div>  \n        <div class="span4 text-right">\n          <button class="btn btn-success margin-wells">\n            Save\n          </button>\n        </div>\n      </div>\n    </form>\n    <div class="alert" ng-show="vm.result" ng-class="{\'alert-success\': vm.result.status === 1,\'alert-error\': vm.result.status === 0}">\n      {$ vm.result.msg $}\n    </div>\n  </div>\n</div>'),n.put("templates/users-list.tpl.html",'<div class="row">\n  <h1>Users List</h1>\n  <p>This is only an example view.</p>\n</div>\n<div class="row">\n  <div class="span4">Email</div>\n  <div class="span4">First Name</div>\n  <div class="span4">Last Name</div>\n</div>  \n<div class="row" ng-repeat="user in vm.users">\n  <div class="span4">{{user.email}}</div>\n  <div class="span4">{{user.firstname}}</div>\n  <div class="span4">{{user.lastname}}</div>\n</div>  ')}]),angular.module("xos.contentProvider").run(["$location",function(n){n.path("/")}]),angular.bootstrap(angular.element("#xosContentProvider"),["xos.contentProvider"]);