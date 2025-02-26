<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单价格" prop="price">
        <el-input
          v-model="queryParams.price"
          placeholder="请输入订单价格"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="支付状态" prop="status" style="width: 180px">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable>
          <el-option
            v-for="dict in pay_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="下单用户" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入下单用户"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:qorder:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:qorder:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="qorderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" :index="1" label="ID" align="center" prop="id" />
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      <el-table-column label="商品名称" align="center" prop="name" />
      <el-table-column label="订单价格" align="center" prop="price" />
      <el-table-column label="商品id" align="center" prop="qgoodId" />
      <el-table-column label="发货状态" align="center" prop="status">
        <template #default="scope">
          <!-- <dict-tag :options="pay_status" :value="scope.row.status"/> -->
          <el-tag type="primary" v-show="scope.row.status == 1">待发货</el-tag>
          <el-tag type="warning" v-show="scope.row.status == 2">待收货</el-tag>
          <el-tag type="success" v-show="scope.row.status == 3">已完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="收货地址" align="center" prop="address" width="180" show-overflow-tooltip/>
      <el-table-column label="下单时间" align="center" prop="addTime" />
      <el-table-column label="支付时间" align="center" prop="payTime" />
      <el-table-column label="物流公司" align="center" prop="express" />
      <el-table-column label="物流单号" align="center" prop="expressNo" />
      <el-table-column label="下单用户" align="center" prop="uid" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:qorder:edit']">收货地址</el-button>
          <el-button link type="primary" icon="Edit" @click="handleExpress(scope.row)" v-hasPermi="['system:order:edit']" v-show="scope.row.status == 1">发货</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:qorder:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改抢购订单管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="qorderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="收货地址" prop="address">
          <el-input v-model="form.address" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog title="发货" v-model="expressOpen" width="500px" append-to-body>
      <el-form ref="expressRef" :model="expressForm" label-width="80px" :rules="expressRules">
        <el-form-item label="物流编码" prop="express">
          <el-input v-model="expressForm.express" type="text" placeholder="请输入物流编码" clearable :style="{width: '100%'}"></el-input>
        </el-form-item>
        <el-form-item label="物流编号" prop="expressNo">
          <el-input v-model="expressForm.expressNo" type="text" placeholder="请输入物流编号" clearable :style="{width: '100%'}"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitExpressForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Qorder">
import { listQorder, getQorder, delQorder, addQorder, updateQorder } from "@/api/system/qorder";

const { proxy } = getCurrentInstance();
const { pay_status } = proxy.useDict('pay_status');

const qorderList = ref([]);
const open = ref(false);
const expressOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  expressForm: {
    express: '',
    expressNo: ''
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: null,
    name: null,
    price: null,
    status: null,
    uid: null
  },
  rules: {
    address: [{ required: true, message: "请输入收货地址", trigger: "blur" }]
  },
  expressRules: {
    express: [{ required: true, message: "请输入物流编码", trigger: "blur" }],
    expressNo: [{ required: true, message: "请输入物流编号", trigger: "blur" }]
  }
});

const { queryParams, form, rules, expressForm, expressRules } = toRefs(data);

/** 查询抢购订单管理列表 */
function getList() {
  loading.value = true;
  listQorder(queryParams.value).then(response => {
    qorderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  expressOpen.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    orderNo: null,
    name: null,
    price: null,
    qgoodId: null,
    status: null,
    address: null,
    addTime: null,
    payTime: null,
    express: null,
    expressNo: null,
    uid: null
  };
  expressForm.value = {
    express: '',
    expressNo: ''
  };
  proxy.resetForm("qorderRef");
  proxy.resetForm("expressRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getQorder(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改收货地址";
  });
}

/** 发货按钮操作 */
function handleExpress(row) {
  reset();
  
  expressForm.value = row
  expressOpen.value = true;
  title.value = "发货";
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["qorderRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateQorder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addQorder(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 提交发货表单 */
function submitExpressForm() {
  console.log(expressForm.value);
  
  proxy.$refs["expressRef"].validate(valid => {
    if (valid) {
      const params = {
        id: expressForm.value.id,
        express: expressForm.value.express,
        expressNo: expressForm.value.expressNo,
        status: 2
      };
      updateQorder(params).then(response => {
        proxy.$modal.msgSuccess("发货成功");
        expressOpen.value = false;
        getList();
      });
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除抢购订单管理编号为"' + _ids + '"的数据项？').then(function() {
    return delQorder(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/qorder/export', {
    ...queryParams.value
  }, `qorder_${new Date().getTime()}.xlsx`)
}

getList();
</script>
