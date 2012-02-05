<?php
/**
 * @author: ArtZub <artzub@gmail.com>
 */
interface IGraphBuilder
{
    public function build($data, $params = array());
    public function getName();
}
