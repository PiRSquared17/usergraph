<?php
header('Content-Type: application/json');
        $mycnf    = parse_ini_file("/data/project/usergraph/replica.my.cnf");
        $username = $mycnf['user'];
        $password = $mycnf['password'];
$dbname = isset($_GET['wiki']) ? $_GET['wiki'] : 'metawiki';
$user = isset($_GET['user']) ? $_GET['user'] : NULL;
$limit = isset($_GET['limit']) ? $_GET['limit'] : 300;
$db = new mysqli($dbname . '.labsdb', $username, $password, $dbname . "_p");
if (is_null($user)) {
$stmt = $db->prepare("SELECT log_user_text as source, REPLACE(log_title,'_',' ') as target, COUNT(*) value FROM logging WHERE log_type='thanks' GROUP BY log_user_text, log_title ORDER BY value DESC LIMIT ?");
$stmt->bind_param("i",$limit);
}
else {
$stmt = $db->prepare("SELECT log_user_text as source, REPLACE(log_title,'_',' ') as target, COUNT(*) value FROM logging WHERE log_type='thanks' AND (log_user_text=? OR log_title=?) GROUP BY log_user_text, log_title ORDER BY value DESC LIMIT ?");
$stmt->bind_param("ssi",str_replace('_',' ',$user),str_replace(' ','_',$user),$limit);
}
if ($stmt) {
    $stmt->execute();

    /* bind variables to prepared statement */
    $stmt->bind_result($source, $target, $value);
$json = array();
while($stmt->fetch()){
  $json[] = array('source' => $source, 'target' => $target, 'value' => $value);
}
echo json_encode($json);
}
