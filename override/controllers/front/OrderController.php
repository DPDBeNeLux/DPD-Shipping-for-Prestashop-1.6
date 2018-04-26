<?php
/**
 * This file is part of the Prestashop Shipping module of DPD Nederland B.V.
 *
 * Copyright (C) 2017  DPD Nederland B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
require_once (_PS_MODULE_DIR_ . 'dpdbenelux' . DS . 'classes' . DS . 'DpdCarrier.php');
class OrderController extends OrderControllerCore
{
	public $dpdCarrier;

	public function __construct()
	{
		parent::__construct();
		$this->dpdCarrier = new DpdCarrier();
	}

	public function _assignWrappingAndTOS()
	{
		parent::_assignWrappingAndTOS();
		$deliveryOptionList = $this->context->cart->getDeliveryOptionList();

		$saturdayCarrierId = $this->dpdCarrier->getLatestCarrierByReferenceId(Configuration::get('dpdbenelux_saturday'));
		$classicSaturdayCarrierId = $this->dpdCarrier->getLatestCarrierByReferenceId(Configuration::get('dpdbenelux_classic_saturday'));

		foreach($deliveryOptionList as &$carriers){
			if(!$this->dpdCarrier->checkIfSaturdayAllowed()) {
				unset($carriers[$saturdayCarrierId . ',']);
				unset($carriers[$classicSaturdayCarrierId . ',']);
			}
		}

		$this->context->smarty->assign(array(
			'delivery_option_list' => $deliveryOptionList,
		));
	}

}